import { clearDiagnosisDrafts } from '@/lib/diagnosisDraftStorage';
import { clearAllDiagnosisFileDrafts } from '@/lib/diagnosisFileDrafts';

function removeByPrefixes(storage: Storage, prefixes: string[]) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (!k) continue;
        if (prefixes.some((p) => k.startsWith(p))) {
            keysToRemove.push(k);
        }
    }
    keysToRemove.forEach((k) => storage.removeItem(k));
}

/**
 * Clear client-side draft caches so forms rehydrate from DB.
 * - projectId provided: clear project-specific draft keys
 * - no projectId: clear all draft keys
 */
export function clearClientDraftCaches(projectId?: number): void {
    if (typeof window === 'undefined') return;

    try {
        if (typeof projectId === 'number') {
            // Diagnosis drafts
            clearDiagnosisDrafts(projectId);
            clearAllDiagnosisFileDrafts(projectId);

            // Project-scoped local drafts
            window.localStorage.removeItem(`performance-draft:${projectId}`);
            window.localStorage.removeItem(`compensation-system-draft:${projectId}`);
            window.localStorage.removeItem(`job-analysis-step-${projectId}`);
            window.localStorage.removeItem(`job-analysis-state-${projectId}`);
            window.sessionStorage.removeItem(`kpi-verified-popup-shown:${projectId}`);
            return;
        }

        // Global cleanup on logout (all projects)
        removeByPrefixes(window.sessionStorage, [
            'diagnosis_draft_tabs_',
            'kpi-verified-popup-shown:',
        ]);
        removeByPrefixes(window.localStorage, [
            'performance-draft:',
            'compensation-system-draft:',
            'job-analysis-step-',
            'job-analysis-state-',
        ]);
    } catch {
        // Ignore storage access failures.
    }
}

