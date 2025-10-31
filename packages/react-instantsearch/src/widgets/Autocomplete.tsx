import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePropGetters,
  createAutocompleteSuggestionComponent,
  cx,
} from 'instantsearch-ui-components';
import React, {
  createElement,
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Configure,
  Index,
  useAutocomplete,
  useSearchBox,
} from 'react-instantsearch-core';

import { SearchBox } from '../widgets/SearchBox';

import type {
  AutocompleteIndexClassNames,
  AutocompleteIndexConfig,
  Pragma,
  AutocompleteClassNames,
} from 'instantsearch-ui-components';
import type { BaseHit, Hit } from 'instantsearch.js';
import type { ComponentProps } from 'react';

const Autocomplete = createAutocompleteComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompletePanel = createAutocompletePanelComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteIndex = createAutocompleteIndexComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteSuggestion = createAutocompleteSuggestionComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const usePropGetters = createAutocompletePropGetters({
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
});

type ItemComponentProps<TItem extends BaseHit> = React.ComponentType<{
  item: Hit<TItem>;
  onSelect: () => void;
}>;

type IndexConfig<TItem extends BaseHit> = AutocompleteIndexConfig<TItem> & {
  itemComponent: ItemComponentProps<TItem>;
  classNames?: Partial<AutocompleteIndexClassNames>;
};

export type AutocompleteProps<TItem extends BaseHit> = ComponentProps<'div'> & {
  indices?: Array<IndexConfig<TItem>>;
  showSuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string }>,
      'indexName' | 'itemComponent' | 'classNames'
    >
  >;
  classNames?: Partial<AutocompleteClassNames>;
};

type InnerAutocompleteProps<TItem extends BaseHit> = Omit<
  AutocompleteProps<TItem>,
  'indices' | 'showSuggestions'
> & {
  indicesConfig: Array<IndexConfig<TItem>>;
  refineSearchBox: ReturnType<typeof useSearchBox>['refine'];
};

export function EXPERIMENTAL_Autocomplete<TItem extends BaseHit = BaseHit>({
  indices = [],
  showSuggestions,
  ...props
}: AutocompleteProps<TItem>) {
  const { refine } = useSearchBox(
    {},
    { $$type: 'ais.autocomplete', $$widgetType: 'ais.autocomplete' }
  );
  const indicesConfig = [...indices];
  if (showSuggestions?.indexName) {
    indicesConfig.unshift({
      indexName: showSuggestions.indexName,
      // Temporarily force casting until the coming refactoring
      itemComponent: (showSuggestions.itemComponent ||
        AutocompleteSuggestion) as unknown as ItemComponentProps<TItem>,
      classNames: {
        root: cx(
          'ais-AutocompleteSuggestions',
          showSuggestions?.classNames?.root
        ),
        list: cx(
          'ais-AutocompleteSuggestionsList',
          showSuggestions?.classNames?.list
        ),
        item: cx(
          'ais-AutocompleteSuggestionsItem',
          showSuggestions?.classNames?.item
        ),
      },
      getQuery: (item) => item.query,
      onSelect: ({ getQuery, setQuery }) => {
        setQuery(getQuery());
      },
    });
  }

  return (
    <Fragment>
      <Index EXPERIMENTAL_isolated>
        <Configure hitsPerPage={5} />
        {indicesConfig.map((index) => (
          <Index key={index.indexName} indexName={index.indexName} />
        ))}
        <InnerAutocomplete
          {...props}
          indicesConfig={indicesConfig}
          refineSearchBox={refine}
        />
      </Index>
    </Fragment>
  );
}

function InnerAutocomplete<TItem extends BaseHit = BaseHit>({
  indicesConfig,
  refineSearchBox,
  ...props
}: InnerAutocompleteProps<TItem>) {
  const { indices, refine: refineAutocomplete } = useAutocomplete();
  const { getInputProps, getItemProps, getPanelProps, getRootProps } =
    usePropGetters<TItem>({
      indices,
      indicesConfig,
      onRefine: (query: string) => {
        refineAutocomplete(query);
        refineSearchBox(query);
      },
    });

  return (
    <Autocomplete {...props} {...getRootProps()}>
      <SearchBox inputProps={getInputProps()} />
      <AutocompletePanel {...getPanelProps()}>
        {indices.map(({ indexId, hits }, index) => (
          <AutocompleteIndex
            key={indexId}
            // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
            ItemComponent={indicesConfig[index].itemComponent}
            items={hits.map((item) => ({
              ...item,
              __indexName: indexId,
            }))}
            getItemProps={getItemProps}
            classNames={indicesConfig[index].classNames}
          />
        ))}
      </AutocompletePanel>
    </Autocomplete>
  );
}
