import { safelyRunOnBrowser } from './safelyRunOnBrowser';

export function hasDetectedInsightsClient(): boolean {
  return safelyRunOnBrowser<boolean>(
    ({ window }) => Boolean((window as any).AlgoliaAnalyticsObject),
    { fallback: () => false }
  );
}
