import type { Flavor } from '../context/flavor';

export function getParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Merges params into the current query string, so writing one never drops
 * another (`?flavor=` is set by the embedding docs page and must survive).
 * Pass `null` to remove a param.
 *
 * Uses `replaceState`, never `pushState`: the showcase is embedded in an
 * iframe on the docs site, where pushing entries makes the page's Back button
 * step through iframe states instead of leaving the page.
 */
export function setParams(params: Record<string, string | null>): void {
  const search = new URLSearchParams(window.location.search);

  Object.entries(params).forEach(([name, value]) => {
    if (value === null) {
      search.delete(name);
    } else {
      search.set(name, value);
    }
  });

  const query = search.toString();
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  );
}

/** Index of the entry whose slug matches `param`, or 0 when absent/unknown. */
export function getIndexFromURL(param: string, slugs: string[]): number {
  const index = slugs.indexOf(getParam(param) ?? '');
  return index === -1 ? 0 : index;
}

const VALID_FLAVORS: Flavor[] = ['js', 'react', 'vue'];

export function getFlavorFromURL(): Flavor {
  const param = getParam('flavor');
  if (param && VALID_FLAVORS.includes(param as Flavor)) {
    return param as Flavor;
  }
  return 'js';
}
