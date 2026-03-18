const draftKey = (projectId: number) => `diagnosis_draft_tabs_${projectId}`;

export type TabDrafts = Record<string, Record<string, unknown>>;

export function loadAllTabDrafts(projectId: number): TabDrafts {
    try {
        const raw = sessionStorage.getItem(draftKey(projectId));
        if (!raw) return {};
        const p = JSON.parse(raw) as TabDrafts;
        return typeof p === 'object' && p !== null ? p : {};
    } catch {
        return {};
    }
}

export function saveTabDraft(projectId: number, tabId: string, data: Record<string, unknown>): void {
    const all = loadAllTabDrafts(projectId);
    all[tabId] = { ...data };
    try {
        sessionStorage.setItem(draftKey(projectId), JSON.stringify(all));
    } catch {
        /* ignore quota */
    }
}

export function mergeTabDraftsIntoDiagnosis<T extends Record<string, unknown>>(
    projectId: number,
    serverDiagnosis: T | undefined | null
): T {
    const base = { ...(serverDiagnosis ?? {}) } as T;
    const tabs = loadAllTabDrafts(projectId);
    for (const patch of Object.values(tabs)) {
        if (patch && typeof patch === 'object') {
            for (const [k, v] of Object.entries(patch)) {
                // Keep UI-only draft keys out of the final merged diagnosis payload.
                if (k.startsWith('__draft')) continue;
                (base as Record<string, unknown>)[k] = v;
            }
        }
    }
    return base;
}

export function clearDiagnosisDrafts(projectId: number): void {
    try {
        sessionStorage.removeItem(draftKey(projectId));
    } catch {
        /* ignore */
    }
}
