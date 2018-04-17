export function previewWrapper() {
  return {
    template: `
      <ais-index appId="latency" apiKey="6be0576ff61c053d5f9a3225e2a90f76" indexName="instant_search">
        <h2>Display</h2>
        <story/>
        <h2>Hits</h2>
        <ais-search-box></ais-search-box>
        <ais-hits></ais-hits>
      </ais-index>
    `,
  };
}
