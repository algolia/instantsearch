import { find } from '../../lib';

import type { ComponentProps, MutableRef } from '../../types';

type BaseHit = Record<string, unknown>;

export type AutocompleteIndexConfig<TItem extends BaseHit> = {
  indexName: string;
  getQuery?: (item: TItem) => string;
  getURL?: (item: TItem) => string;
  onSelect?: (params: {
    item: TItem;
    query: string;
    setQuery: (query: string) => void;
    url?: string;
  }) => void;
};

type GetInputProps = () => ComponentProps<'input'>;

type ValidAriaRole = 'combobox' | 'row' | 'grid';

type GetItemProps = (
  item: { __indexName: string } & Record<string, unknown>,
  index: number
) => {
  id?: string;
  role?: ValidAriaRole;
  'aria-selected'?: boolean;
} & {
  onSelect: () => void;
  onApply: () => void;
};

type GetPanelProps = () => {
  id?: string;
  hidden?: boolean;
  role?: ValidAriaRole;
  'aria-labelledby'?: string;
};

type GetRootProps = () => { ref?: MutableRef<HTMLDivElement | null> };

type CreateAutocompletePropGettersParams = {
  useEffect: (effect: () => void, inputs?: readonly unknown[]) => void;
  useId: () => string;
  useMemo: <TType>(factory: () => TType, inputs: readonly unknown[]) => TType;
  useRef: <TType>(initialValue: TType | null) => { current: TType | null };
  useState: <TType>(
    initialState: TType
  ) => [TType, (newState: TType) => unknown];
};

export type UsePropGetters<TItem extends BaseHit> = (params: {
  indices: Array<{
    indexName: string;
    indexId: string;
    hits: Array<{ [key: string]: unknown }>;
  }>;
  indicesConfig: Array<AutocompleteIndexConfig<TItem>>;
  onRefine: (query: string) => void;
  onSelect: NonNullable<AutocompleteIndexConfig<TItem>['onSelect']>;
  onApply: (query: string) => void;
  placeholder?: string;
}) => {
  getInputProps: GetInputProps;
  getItemProps: GetItemProps;
  getPanelProps: GetPanelProps;
  getRootProps: GetRootProps;
};

export function createAutocompletePropGetters({
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
}: CreateAutocompletePropGettersParams) {
  return function usePropGetters<TItem extends BaseHit>({
    indices,
    indicesConfig,
    onRefine,
    onSelect: globalOnSelect,
    onApply,
    placeholder,
  }: Parameters<UsePropGetters<TItem>>[0]): ReturnType<UsePropGetters<TItem>> {
    const getElementId = createGetElementId(useId());
    const inputRef = useRef<HTMLInputElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [activeDescendant, setActiveDescendant] = useState<
      string | undefined
    >(undefined);

    const { items, itemsIds } = useMemo(
      () => buildItems({ indices, indicesConfig, getElementId }),
      [indices, indicesConfig, getElementId]
    );

    useEffect(() => {
      const onBodyClick = (event: MouseEvent) => {
        if (unwrapRef(rootRef)?.contains(event.target as HTMLElement)) {
          return;
        }

        setIsOpen(false);
      };

      document.body.addEventListener('click', onBodyClick);

      return () => {
        document.body.removeEventListener('click', onBodyClick);
      };
    }, [rootRef]);

    const getNextActiveDescendant = (key: string): string | undefined => {
      switch (key) {
        case 'ArrowLeft':
        case 'ArrowUp': {
          const prevIndex = itemsIds.indexOf(activeDescendant || '') - 1;
          return itemsIds[prevIndex] || itemsIds[itemsIds.length - 1];
        }
        case 'ArrowRight':
        case 'ArrowDown': {
          const nextIndex = itemsIds.indexOf(activeDescendant || '') + 1;
          return itemsIds[nextIndex] || itemsIds[0];
        }
        default:
          return undefined;
      }
    };

    const submit = (
      override: {
        query?: string;
        activeDescendant?: string;
      } = {}
    ) => {
      if (isOpen) {
        setIsOpen(false);
      } else {
        inputRef.current?.blur();
      }

      const actualDescendant = override.activeDescendant ?? activeDescendant;

      if (!actualDescendant && override.query) {
        onRefine(override.query);
      }

      if (actualDescendant && items.has(actualDescendant)) {
        const {
          item,
          config: { onSelect: indexOnSelect, getQuery, getURL },
        } = items.get(actualDescendant)!;
        const actualOnSelect = indexOnSelect ?? globalOnSelect;
        actualOnSelect({
          item,
          query: getQuery?.(item) ?? '',
          url: getURL?.(item),
          setQuery: (query) => onRefine(query),
        });
        setActiveDescendant(undefined);
      }
    };

    return {
      getInputProps: () => ({
        id: getElementId('input'),
        ref: inputRef,
        role: 'combobox',
        'aria-autocomplete': 'list',
        'aria-expanded': isOpen,
        'aria-haspopup': 'grid',
        'aria-controls': getElementId('panel'),
        'aria-activedescendant': activeDescendant,
        placeholder,
        onFocus: () => setIsOpen(true),
        onKeyDown: (event) => {
          switch (event.key) {
            case 'Escape': {
              if (isOpen) {
                setIsOpen(false);
                event.preventDefault();
              } else {
                setActiveDescendant(undefined);
              }
              break;
            }
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'ArrowRight':
            case 'ArrowDown': {
              setIsOpen(true);

              const nextActiveDescendant = getNextActiveDescendant(event.key)!;
              setActiveDescendant(nextActiveDescendant);
              document
                .getElementById(nextActiveDescendant)
                ?.scrollIntoView(false);

              event.preventDefault();
              break;
            }
            case 'Enter': {
              submit({ query: (event.target as HTMLInputElement).value });
              break;
            }
            case 'Tab':
              setIsOpen(false);
              break;
            default:
              setIsOpen(true);
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
              setActiveDescendant(undefined);
              break;
          }
        },
      }),
      getItemProps: (item, index) => {
        const id = getElementId('item', item.__indexName, index);

        return {
          id,
          role: 'row',
          'aria-selected': id === activeDescendant,
          onSelect: () => submit({ activeDescendant: id }),
          onApply: () => {
            const {
              item: currentItem,
              config: { getQuery },
            } = items.get(id)!;
            onApply(getQuery?.(currentItem) ?? '');
          },
        };
      },
      getPanelProps: () => ({
        hidden: !isOpen,
        id: getElementId('panel'),
        role: 'grid',
        'aria-labelledby': getElementId('input'),
      }),
      getRootProps: () => ({
        ref: rootRef,
      }),
    };
  };
}

function buildItems<TItem extends BaseHit>({
  indices,
  indicesConfig,
  getElementId,
}: Pick<Parameters<UsePropGetters<TItem>>[0], 'indices' | 'indicesConfig'> & {
  getElementId: ReturnType<typeof createGetElementId>;
}) {
  const itemsIds = [];
  const items = new Map<
    string,
    { item: TItem; config: AutocompleteIndexConfig<TItem> }
  >();

  for (let i = 0; i < indices.length; i++) {
    const currentIndexConfig = find(
      indicesConfig,
      (config) => config.indexName === indices[i].indexName
    );

    const hits = indices[i]?.hits || [];

    for (let position = 0; position < hits.length; position++) {
      const itemId = getElementId(
        'item',
        currentIndexConfig?.indexName || indices[i].indexName,
        position
      );
      items.set(itemId, {
        item: hits[position] as TItem,
        config: currentIndexConfig!,
      });
      itemsIds.push(itemId);
    }
  }
  return { items, itemsIds };
}

function createGetElementId(autocompleteId: string) {
  return function getElementId(...suffixes: Array<string | number>) {
    const prefix = 'autocomplete';
    return `${prefix}${autocompleteId}${suffixes.join(':')}`;
  };
}

/**
 * Returns the framework-agnostic value of a ref.
 */
function unwrapRef<TType>(ref: { current: TType | null }): TType | null {
  return ref.current && typeof ref.current === 'object' && 'base' in ref.current
    ? (ref.current.base as TType) // Preact
    : ref.current; // React
}
