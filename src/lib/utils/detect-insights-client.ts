export default function hasDetectedInsightsClient(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean((window as any).AlgoliaAnalyticsObject)
  );
}
