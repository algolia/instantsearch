export default function hasDetectedInsightsClient(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window && (window as any).AlgoliaAnalyticsObject)
  );
}
