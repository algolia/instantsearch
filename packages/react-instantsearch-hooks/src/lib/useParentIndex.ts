import { walkIndex } from 'instantsearch.js/es/lib/utils';

import { useIndexContext } from './useIndexContext';
import { useInstantSearchContext } from './useInstantSearchContext';

import type { IndexWidget } from 'instantsearch.js';

export type UseParentIndexProps = {
  /**
   * Logically mount this index to a different parent.
   * If `null`, the index is mounted to the main index.
   */
  parentIndexId?: string | null;
};

export function useParentIndex({ parentIndexId }: UseParentIndexProps) {
  const physicalParentIndex = useIndexContext();
  const search = useInstantSearchContext();

  if (parentIndexId === null) {
    return search.mainIndex;
  }

  if (parentIndexId) {
    let foundIndex: IndexWidget | null = null;
    walkIndex(search.mainIndex, (currentIndex) => {
      if (currentIndex.getIndexId() === parentIndexId) {
        foundIndex = currentIndex;
      }
    });

    if (!foundIndex) {
      throw new Error(`Couldn't find index ${parentIndexId}`);
    }

    return foundIndex;
  }

  return physicalParentIndex;
}
