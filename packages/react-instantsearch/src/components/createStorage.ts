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

function getLocalStorage() {
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
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // do nothing, this likely means the storage is full
      }
    },
    getItems(): string[] {
      const items = window.localStorage.getItem(LOCAL_STORAGE_KEY);

      return items ? (JSON.parse(items) as string[]) : [];
    },
  };
}

export function createStorage({ limit = 5 }: { limit: number }) {
  const storage = getLocalStorage();
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
    getAll(query = '') {
      return storage
        .getItems()
        .filter((q) => q.includes(query))
        .slice(0, limit);
    },
    registerUpdateListener(callback: () => void) {
      updateListener = callback;
    },
    unregisterUpdateListener() {
      updateListener = null;
    },
  };
}
