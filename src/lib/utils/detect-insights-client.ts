import { safelyRunOnBrowser } from './safelyRunOnBrowser';

export default function hasDetectedInsightsClient(): boolean {
  return safelyRunOnBrowser<boolean>(
    ({ window }) => Boolean((window as any).AlgoliaAnalyticsObject),
    { fallback: () => false }
  );
}
