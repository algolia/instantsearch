export default function getDetectedInsightsClient() {
  if (typeof window !== 'undefined' && window) {
    const aa = (window as any).aa;
    if (typeof aa === 'function') {
      return aa;
    }
  }
  return false;
}
