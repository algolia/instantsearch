import type { Hit } from '../../types';

/**
 * Strips InstantSearch metadata, which is `_`-prefixed (`_highlightResult`,
 * `_rankingInfo`, `__position`, …), so only record attributes reach the agent.
 */
export function stripInternalHitMetadata(hit: Hit): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  Object.keys(hit).forEach((key) => {
    if (!key.startsWith('_')) {
      clean[key] = (hit as Record<string, unknown>)[key];
    }
  });
  return clean;
}
