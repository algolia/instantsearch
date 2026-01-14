import { find } from '../../lib';

import type { UsePropGetters } from './createAutocompletePropGetters';

export type CreateAutocompleteStorageParams = {
  useEffect: (effect: () => void, inputs?: readonly unknown[]) => void;
  useMemo: <TType>(factory: () => TType, inputs: readonly unknown[]) => TType;
  useState: <TType>(
    initialState: TType
  ) => [TType, (newState: TType) => unknown];
};

type UseStorageParams<TItem extends Record<string, unknown>> = {
  showRecent?: boolean | { storageKey?: string };
  query?: string;
  suggestionsIndexName?: string;
} & Pick<Parameters<UsePropGetters<TItem>>[0], 'indices' | 'indicesConfig'>;

export function createAutocompleteStorage({
  useEffect,
  useMemo,
  useState,
}: CreateAutocompleteStorageParams) {
  return function useStorage<TItem extends Record<string, unknown>>({
    showRecent,
    query,
    indices,
    indicesConfig,
    suggestionsIndexName,
  }: UseStorageParams<TItem>) {
    const storageKey =
      showRecent && typeof showRecent === 'object'
        ? showRecent.storageKey
        : undefined;
    const storage = useMemo(
      () => createStorage({ limit: 5, storageKey }),
      [storageKey]
    );
    const [snapshot, setSnapshot] = useState(storage.getSnapshot());
    useEffect(() => {
      storage.registerUpdateListener(() => {
        setSnapshot(storage.getSnapshot());
      });
      return () => {
        storage.unregisterUpdateListener();
      };
    }, [storage]);

    if (!showRecent) {
      return {
        storage: { onAdd: () => {}, onRemove: () => {} },
        storageHits: [],
        indicesForPropGetters: indices,
        indicesConfigForPropGetters: indicesConfig,
      };
    }

    const storageHits = snapshot.getAll(query).map((value) => ({
      objectID: value,
      query: value,
      __indexName: 'recent-searches',
      _highlightResult: getHighlightedAttribute({
        item: { query: value },
        query: query || '',
      }),
    }));

    const indicesForPropGetters = [
      ...indices.map((index) =>
        index.indexName === suggestionsIndexName
          ? {
              ...index,
              hits: index.hits.filter(
                (hit) =>
                  !find(
                    storageHits,
                    (storageHit) => storageHit.query === hit.query
                  )
              ),
            }
          : index
      ),
    ];
    const indicesConfigForPropGetters = [...indicesConfig];
    indicesForPropGetters.unshift({
      indexName: 'recent-searches',
      indexId: 'recent-searches',
      hits: storageHits,
    });
    indicesConfigForPropGetters.unshift({
      indexName: 'recent-searches',
      // @ts-expect-error - we know it has query as it's generated from storageHits
      getQuery: (item) => item.query,
    });

    return {
      storage,
      storageHits,
      indicesForPropGetters,
      indicesConfigForPropGetters,
    };
  };
}

const LOCAL_STORAGE_KEY_TEST = 'test-localstorage-support';
const LOCAL_STORAGE_KEY = 'autocomplete-recent-searches';

function isLocalStorageSupported() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_TEST, '');
    localStorage.removeItem(LOCAL_STORAGE_KEY_TEST);

    return true;
  } catch (error) {
    return false;
  }
}

function getHighlightedAttribute({
  item,
  query,
}: {
  item: { query: string };
  query: string;
}) {
  if (!query.trim().length) {
    return { query: { matchLevel: 'none' } };
  }

  return {
    query: {
      value: item.query.replace(
        new RegExp(query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'),
        (match) => {
          return `<mark>${match}</mark>`;
        }
      ),
    },
  };
}

function getLocalStorage(key: string = LOCAL_STORAGE_KEY) {
  if (!isLocalStorageSupported()) {
    return {
      setItems() {},
      getItems() {
        return [];
      },
    };
  }

  return {
    setItems(items: string[]) {
      try {
        window.localStorage.setItem(key, JSON.stringify(items));
      } catch {
        // do nothing, this likely means the storage is full
      }
    },
    getItems(): string[] {
      const items = window.localStorage.getItem(key);

      return items ? (JSON.parse(items) as string[]) : [];
    },
  };
}

export function createStorage({
  limit = 5,
  storageKey,
}: {
  limit: number;
  storageKey?: string;
}) {
  const storage = getLocalStorage(storageKey);
  let updateListener: (() => void) | null = null;

  return {
    onAdd(query: string) {
      this.onRemove(query);
      storage.setItems([query, ...storage.getItems()]);
    },
    onRemove(query: string) {
      storage.setItems(storage.getItems().filter((q) => q !== query));

      updateListener?.();
    },
    registerUpdateListener(callback: () => void) {
      updateListener = callback;
    },
    unregisterUpdateListener() {
      updateListener = null;
    },
    getSnapshot() {
      return {
        getAll(query = ''): string[] {
          return storage
            .getItems()
            .filter((q) => q.includes(query))
            .slice(0, limit);
        },
      };
    },
  };
}
