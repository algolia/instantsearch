import { createUUID } from '../lib/utils';

const USAGE_SESSION_KEY = 'ais.usage.sessionId';

// Cache the id for the lifetime of the runtime so repeated calls don't hit
// `sessionStorage` again, and so we always return the same id even when
// storage is unavailable (SSR, privacy mode) and we fall back to a fresh UUID.
let usageSessionId: string | null = null;

export function getUsageSessionId(): string {
  if (usageSessionId) {
    return usageSessionId;
  }

  try {
    const existing = sessionStorage.getItem(USAGE_SESSION_KEY);
    if (existing) {
      usageSessionId = existing;
      return usageSessionId;
    }
    usageSessionId = createUUID();
    sessionStorage.setItem(USAGE_SESSION_KEY, usageSessionId);
    return usageSessionId;
  } catch {
    // sessionStorage unavailable (SSR, privacy mode, etc.)
    usageSessionId = createUUID();
    return usageSessionId;
  }
}
