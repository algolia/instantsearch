import { connectAutocomplete } from 'instantsearch.js/es/connectors';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useConnector, useInstantSearch } from 'react-instantsearch-core';

import type { BaseHit, Hit } from 'instantsearch.js';
import type { ComponentProps } from 'react';

export type IndexConfig<TItem extends BaseHit> = {
  indexName: string;
  getQuery?: (item: Hit<TItem>) => string;
  getURL?: (item: Hit<TItem>) => string;
  onSelect?: (params: {
    item: Hit<TItem>;
    getQuery: () => string;
    getURL: () => string;
    setQuery: (query: string) => void;
  }) => void;
};

type GetIndexProps = () => {
  indexId: string;
};

type GetInputProps = () => Pick<
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

type GetItemProps = (
  item: { __indexName: string } & Record<string, unknown>,
  index: number
) => Pick<
  ComponentProps<'li'>,
  'id' | 'role' | 'aria-selected' | 'onMouseEnter' | 'onMouseLeave'
> & {
  onSelect: () => void;
};

type GetPanelProps = () => Pick<
  ComponentProps<'div'>,
  'id' | 'hidden' | 'ref' | 'role' | 'aria-labelledby'
>;

type GetRootProps = () => Pick<ComponentProps<'div'>, 'ref'>;

type UseAutocomplete<TItem extends BaseHit> = (params: {
  indices: Array<IndexConfig<TItem>>;
}) => {
  getIndexProps: GetIndexProps;
  getInputProps: GetInputProps;
  getItemProps: GetItemProps;
  getPanelProps: GetPanelProps;
  getRootProps: GetRootProps;
};

type UseAutocompleteItems<TItem extends BaseHit> = Record<
  string,
  {
    item: Hit<TItem>;
    getQuery: () => string;
    getURL: () => string;
    onSelect?: IndexConfig<TItem>['onSelect'];
  }
>;

export function useAutocomplete<TItem extends BaseHit = BaseHit>({
  indices,
}: Parameters<UseAutocomplete<TItem>>['0']): ReturnType<
  UseAutocomplete<TItem>
> {
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

  const items = indices.reduce<UseAutocompleteItems<TItem>>(
    (itemsAcc, index) => {
      const indexItems =
        connectorIndices
          .find(({ indexName }) => index.indexName === indexName)
          ?.hits.reduce(
            (indexItemsAcc, item, i) => ({
              ...indexItemsAcc,
              [getElementId('item', index.indexName, i)]: {
                item,
                indexName: index.indexName,
                getQuery: () => index.getQuery?.(item as Hit<TItem>) || '',
                getURL: () => index.getURL?.(item as Hit<TItem>) || '',
                onSelect: index.onSelect,
              },
            }),
            {}
          ) || {};

      return {
        ...itemsAcc,
        ...indexItems,
      };
    },
    {}
  );

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
    if (activeDescendent && items[activeDescendent]) {
      const { item, onSelect, getQuery, getURL } = items[activeDescendent];
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

  return {
    getIndexProps: () => ({ indexId: getElementId('index') }),
    getInputProps: () => ({
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
    }),
    getItemProps: (item, index) => {
      const id = getElementId('item', item.__indexName, index);

      return {
        id,
        role: 'row',
        'aria-selected': id === activeDescendent,
        onMouseEnter: () => setActiveDescendent(id),
        onMouseLeave: () => setActiveDescendent(undefined),
        onSelect: () => submit(),
      };
    },
    getPanelProps: () => ({
      ref: panelRef,
      hidden: !isOpen,
      id: getElementId('panel'),
      role: 'grid',
      'aria-labelledby': getElementId('input'),
    }),
    getRootProps: () => ({
      ref: rootRef,
    }),
  };
}

function createGetElementId(autocompleteId: string) {
  return function getElementId(...suffixes: Array<string | number>) {
    const prefix = 'autocomplete';
    return `${prefix}${autocompleteId}${suffixes.join(':')}`;
  };
}
