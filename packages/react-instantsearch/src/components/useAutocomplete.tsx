import { connectAutocomplete } from 'instantsearch.js/es/connectors';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useConnector, useInstantSearch } from 'react-instantsearch-core';

import type { BaseHit, Hit } from 'instantsearch.js';
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
  ComponentProps<'li'>,
  'id' | 'role' | 'aria-selected' | 'onMouseEnter' | 'onMouseLeave'
> & {
  onSelect: () => void;
};

type AutocompleteGetPanelProps = () => Pick<
  ComponentProps<'div'>,
  'id' | 'hidden' | 'ref' | 'role' | 'aria-labelledby'
>;

type AutocompleteGetRootProps = () => Pick<ComponentProps<'div'>, 'ref'>;

type AutocompleteStore<TItem extends Hit<BaseHit> = Hit<BaseHit> | any> =
  Record<
    string,
    {
      item: TItem;
      getQuery: () => string;
      getURL: () => string;
      onSelect?: (params: {
        item: TItem;
        getQuery: () => string;
        getURL: () => string;
        setQuery: (query: string) => void;
      }) => void;
    }
  >;

type UseAutocompleteParams<TItem extends Hit<BaseHit> = Hit<BaseHit> | any> = {
  indices: Array<{
    indexName: string;
    getQuery?: (item: TItem) => string;
    getURL?: (item: TItem) => string;
    onSelect?: (params: {
      item: TItem;
      getQuery: () => string;
      getURL: () => string;
      setQuery: (query: string) => void;
    }) => void;
  }>;
};

export const useAutocomplete = <
  TItem extends Hit<BaseHit> = Hit<BaseHit> | any
>({
  indices,
}: UseAutocompleteParams<TItem>) => {
  const { indices: connectorIndices, refine } = useConnector(
    connectAutocomplete,
    {}
  );
  const { setUiState } = useInstantSearch();

  const getElementId = createGetElementId(useId());
  const rootRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeDescendent, setActiveDescendent] = useState<string | undefined>(
    undefined
  );

  const store = indices.reduce<AutocompleteStore<TItem>>((storeAcc, index) => {
    const items =
      connectorIndices
        .find(({ indexName }) => index.indexName === indexName)
        ?.hits.reduce(
          (itemsAcc, item, i) => ({
            ...itemsAcc,
            [getElementId('item', index.indexName, i)]: {
              item,
              indexName: index.indexName,
              getQuery: () => index.getQuery?.(item as TItem) || '',
              getURL: () => index.getURL?.(item as TItem) || '',
              onSelect: index.onSelect,
            },
          }),
          {}
        ) || {};

    return {
      ...storeAcc,
      ...items,
    };
  }, {});

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

  const submit = () => {
    setIsOpen(false);
    if (activeDescendent && store[activeDescendent]) {
      const { item, onSelect, getQuery, getURL } = store[activeDescendent];
      onSelect?.({
        item,
        getQuery,
        getURL,
        setQuery(query) {
          refine(query);
        },
      });
      setUiState((uiState) => ({
        ...uiState,
        [getElementId('index')]: { query: getQuery() },
      }));
      setActiveDescendent(undefined);
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
          submit();
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
      onSelect: () => submit(),
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

  return {
    getIndexProps,
    getInputProps,
    getItemProps,
    getPanelProps,
    getRootProps,
  };
};

function createGetElementId(autocompleteId: string) {
  return function getElementId(...suffixes: Array<string | number>) {
    const prefix = 'autocomplete';
    return `${prefix}${autocompleteId}${suffixes.join(':')}`;
  };
}
