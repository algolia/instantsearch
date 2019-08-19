import { hitsPerPage as hitsPerPageWidget } from 'instantsearch.js/es/widgets';

const items = [
  {
    label: '16 hits per page',
    value: 16,
    default: true,
  },
  {
    label: '32 hits per page',
    value: 32,
  },
  {
    label: '64 hits per page',
    value: 64,
  },
];

export const hitsPerPage = hitsPerPageWidget({
  container: '[data-widget="hits-per-page"]',
  items,
});

export function getFallbackHitsPerPageRoutingValue(
  hitsPerPageValue: string
): string | undefined {
  if (items.map(item => item.value).indexOf(Number(hitsPerPageValue)) !== -1) {
    return hitsPerPageValue;
  }

  return undefined;
}
