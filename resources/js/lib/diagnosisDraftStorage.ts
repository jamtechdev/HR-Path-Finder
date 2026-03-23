import { DIAGNOSIS_ORG_CHART_REQUIRED_YEARS } from '@/config/diagnosisConstants';

const draftKey = (projectId: number) => `diagnosis_draft_tabs_${projectId}`;

export type TabDrafts = Record<string, Record<string, unknown>>;

/** String paths only (File objects are never in JSON drafts). */
function orgChartsAsPathRecord(value: unknown): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }
    const out: Record<string, string> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (typeof val === 'string' && val.trim() !== '') {
            out[key] = val;
        }
    }
    return out;
}

/**
 * Serialized tab drafts drop File blobs, so organizational_charts often becomes {}.
 * Do not let that overwrite server-stored chart paths.
 */
function shouldSkipMergingOrganizationalCharts(draftValue: unknown, serverValue: unknown): boolean {
    const serverPaths = orgChartsAsPathRecord(serverValue);
    if (Object.keys(serverPaths).length === 0) {
        return false;
    }
    const draftPaths = orgChartsAsPathRecord(draftValue);
    const draftHasAllRequired = DIAGNOSIS_ORG_CHART_REQUIRED_YEARS.every(
        (y) => typeof draftPaths[y] === 'string' && draftPaths[y].trim() !== '',
    );
    if (draftHasAllRequired) {
        return false;
    }
    const draftWouldReplaceWithEmpty =
        draftValue !== undefined &&
        draftValue !== null &&
        typeof draftValue === 'object' &&
        !Array.isArray(draftValue) &&
        Object.keys(draftPaths).length === 0;
    return draftWouldReplaceWithEmpty;
}

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
                if (k === 'organizational_charts' && shouldSkipMergingOrganizationalCharts(v, base.organizational_charts)) {
                    continue;
                }
                if (k === 'organizational_charts' && v && typeof v === 'object' && !Array.isArray(v)) {
                    const prev = orgChartsAsPathRecord(base.organizational_charts);
                    const next = orgChartsAsPathRecord(v);
                    (base as Record<string, unknown>)[k] = { ...prev, ...next };
                    continue;
                }
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
