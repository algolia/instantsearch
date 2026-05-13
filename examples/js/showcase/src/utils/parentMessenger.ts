// Posts a message to the embedding docs page. No-op when this showcase isn't
// loaded inside an iframe. The browser drops posts to non-matching origins,
// so listing both prod and the local Mintlify dev origin is safe.
const TARGET_ORIGINS = [
  "https://www.algolia.com",
  "http://localhost:3000",
];

export function postToParent(data: unknown): void {
  if (typeof window === "undefined" || window.parent === window) return;
  for (const origin of TARGET_ORIGINS) {
    window.parent.postMessage(data, origin);
  }
}
