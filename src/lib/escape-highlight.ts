import { Hit, FacetHit } from '../types';
import { isPlainObject, escape } from '../lib/utils';

export const TAG_PLACEHOLDER = {
  highlightPreTag: '__ais-highlight__',
  highlightPostTag: '__/ais-highlight__',
};

export const TAG_REPLACEMENT = {
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
};

function replaceTagsAndEscape(value: string): string {
  return escape(value)
    .replace(
      new RegExp(TAG_PLACEHOLDER.highlightPreTag, 'g'),
      TAG_REPLACEMENT.highlightPreTag
    )
    .replace(
      new RegExp(TAG_PLACEHOLDER.highlightPostTag, 'g'),
      TAG_REPLACEMENT.highlightPostTag
    );
}

function recursiveEscape(input: any): any {
  if (isPlainObject(input) && typeof input.value !== 'string') {
    return Object.keys(input).reduce(
      (acc, key) => ({
        ...acc,
        [key]: recursiveEscape(input[key]),
      }),
      {}
    );
  }

  if (Array.isArray(input)) {
    return input.map(recursiveEscape);
  }

  return {
    ...input,
    value: replaceTagsAndEscape(input.value),
  };
}

export type EscapedHits<THit = Hit> = THit[] & { __escaped: boolean };

export default function escapeHits<THit extends Hit>(
  hits: THit[]
): EscapedHits<THit> {
  if ((hits as EscapedHits<THit>).__escaped === undefined) {
    hits = hits.map(hit => {
      if (hit._highlightResult) {
        hit._highlightResult = recursiveEscape(hit._highlightResult);
      }

      if (hit._snippetResult) {
        hit._snippetResult = recursiveEscape(hit._snippetResult);
      }

      return hit;
    });

    (hits as EscapedHits<THit>).__escaped = true;
  }

  return (hits as unknown) as EscapedHits<THit>;
}

export function escapeFacets(facetHits: FacetHit[]): FacetHit[] {
  return facetHits.map(h => ({
    ...h,
    highlighted: replaceTagsAndEscape(h.highlighted),
  }));
}
