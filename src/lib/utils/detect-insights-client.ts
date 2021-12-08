import { safelyRunOnBrowser } from './safelyRunOnBrowser.js';

export default function hasDetectedInsightsClient(): boolean {
  return safelyRunOnBrowser<boolean>(
    ({ window }) => Boolean((window as any).AlgoliaAnalyticsObject),
    { fallback: () => false }
  );
}
