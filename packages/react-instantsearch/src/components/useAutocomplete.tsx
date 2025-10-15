import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useInstantSearch } from 'react-instantsearch-core';

import type { ComponentProps } from 'react';

type AutocompleteGetInputProps = () => Pick<
  ComponentProps<'input'>,
  | 'id'
  | 'role'
  | 'aria-activedescendant'
  | 'aria-autocomplete'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'onBlur'
  | 'onFocus'
  | 'onKeyDown'
  | 'onKeyUp'
>;

type AutocompleteGetItemProps = (
  item: {
    objectID: string;
    __indexName?: string;
  } & Record<string, unknown>,
  index: number
) => Pick<
  ComponentProps<'div'>,
  'id' | 'role' | 'aria-selected' | 'onMouseEnter' | 'onMouseLeave'
>;

type AutocompleteGetPanelProps = () => Pick<
  ComponentProps<'div'>,
  'id' | 'hidden' | 'ref' | 'role' | 'aria-labelledby'
>;

type AutocompleteGetRootProps = () => Pick<ComponentProps<'div'>, 'ref'>;

type AutocompleteUpdateStoreParams = {
  indexName: string;
  items: Array<{ objectID: string } & Record<string, unknown>>;
  onSelect: (item: { objectID: string } & Record<string, unknown>) => void;
  getQuery?: (item: { objectID: string } & Record<string, unknown>) => string;
  getURL?: (item: { objectID: string } & Record<string, unknown>) => string;
};

export const useAutocomplete = () => {
  const { setUiState } = useInstantSearch();

  const getElementId = createGetElementId(useId());
  const rootRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeDescendent, setActiveDescendent] = useState<string | undefined>(
    undefined
  );

  const store = new Map<
    string,
    {
      item: AutocompleteUpdateStoreParams['items'][0];
      getQuery: () => string;
      getURL: () => string;
    } & Omit<AutocompleteUpdateStoreParams, 'items' | 'getQuery' | 'getURL'>
  >();

  useLayoutEffect(() => {
    const onBodyClick = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as HTMLElement)) {
        return;
      }

      setIsOpen(false);
    };

    document.body.addEventListener('click', onBodyClick);

    return () => {
      document.body.removeEventListener('click', onBodyClick);
    };
  }, [rootRef]);

  const getNextActiveDescendent = (key: string): string | undefined => {
    if (!panelRef.current) {
      return undefined;
    }

    const rows = [...panelRef.current.querySelectorAll('[role="row"]')];
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp': {
        const prevIndex =
          rows.findIndex((row) => row.id === activeDescendent) - 1;

        if (rows[prevIndex]) {
          return rows[prevIndex].id;
        }

        return rows[rows.length - 1].id;
      }
      case 'ArrowRight':
      case 'ArrowDown': {
        const nextIndex =
          rows.findIndex((row) => row.id === activeDescendent) + 1;

        if (rows[nextIndex]) {
          return rows[nextIndex].id;
        }

        return rows[0].id;
      }
      default:
        return undefined;
    }
  };

  const getInputProps: AutocompleteGetInputProps = () => ({
    id: getElementId('input'),
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': isOpen,
    'aria-haspopup': 'grid',
    'aria-controls': getElementId('panel'),
    'aria-activedescendant': activeDescendent,
    onFocus: () => setIsOpen(true),
    onKeyDown: (event) => {
      if (event.key === 'Escape') {
        setActiveDescendent(undefined);
        setIsOpen(false);
        return;
      }
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
          setActiveDescendent(getNextActiveDescendent(event.key));
          event.preventDefault();
          break;
        case 'Enter': {
          setIsOpen(false);
          if (activeDescendent && store.has(activeDescendent)) {
            const { item, onSelect, getQuery } = store.get(activeDescendent)!;
            onSelect(item);
            setUiState((uiState) => ({
              ...uiState,
              [getElementId('index')]: { query: getQuery() },
            }));
            setActiveDescendent(undefined);
          }
          break;
        }
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          return;
      }
    },
    onKeyUp: (event) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
        case 'Escape':
        case 'Return':
          event.preventDefault();
          return;
        default:
          setActiveDescendent(undefined);
          break;
      }
    },
  });

  const getIndexProps = () => {
    return {
      indexId: getElementId('index'),
    };
  };

  const getItemProps: AutocompleteGetItemProps = (item, index) => {
    const id = getElementId('item', item.__indexName || '', index);

    return {
      id,
      role: 'row',
      'aria-selected': id === activeDescendent,
      onMouseEnter: () => setActiveDescendent(id),
      onMouseLeave: () => setActiveDescendent(undefined),
    };
  };

  const getPanelProps: AutocompleteGetPanelProps = () => ({
    ref: panelRef,
    hidden: !isOpen,
    id: getElementId('panel'),
    role: 'grid',
    'aria-labelledby': getElementId('input'),
  });

  const getRootProps: AutocompleteGetRootProps = () => ({
    ref: rootRef,
  });

  const updateStore = ({
    indexName,
    items,
    getQuery,
    getURL,
    onSelect,
  }: AutocompleteUpdateStoreParams) => {
    items.forEach((item, index) => {
      store.set(getElementId('item', indexName, index), {
        item,
        indexName,
        getQuery: () => getQuery?.(item) || '',
        getURL: () => getURL?.(item) || '',
        onSelect,
      });
    });
  };

  return {
    isOpen,
    setIsOpen,
    getIndexProps,
    getInputProps,
    getItemProps,
    getPanelProps,
    getRootProps,
    updateStore,
  };
};

function createGetElementId(autocompleteId: string) {
  return function getElementId(...suffixes: Array<string | number>) {
    const prefix = 'autocomplete';
    return `${prefix}${autocompleteId}${suffixes.join(':')}`;
  };
}
