import React, { useRef, useState } from 'react';
import { useInstantSearch, useSearchBox } from 'react-instantsearch-core';

import { SearchBox as SearchBoxUiComponent } from '../ui/SearchBox';

import type { SearchBoxProps as SearchBoxUiComponentProps } from '../ui/SearchBox';
import type { UseSearchBoxProps } from 'react-instantsearch-core';

type UiProps = Pick<
  SearchBoxUiComponentProps,
  | 'inputRef'
  | 'isSearchStalled'
  | 'onChange'
  | 'onReset'
  | 'onSubmit'
  | 'value'
  | 'autoFocus'
  | 'translations'
>;

export type SearchBoxProps = Omit<
  SearchBoxUiComponentProps,
  Exclude<keyof UiProps, 'onSubmit' | 'autoFocus'>
> &
  UseSearchBoxProps & {
    /**
     * Whether to trigger the search only on submit.
     * @default true
     */
    searchAsYouType?: boolean;
    /**
     * Whether to update the search state in the middle of a
     * composition session.
     * @default false
     */
    ignoreCompositionEvents?: boolean;
    translations?: Partial<UiProps['translations']>;
  };

export function SearchBox({
  queryHook,
  searchAsYouType = true,
  ignoreCompositionEvents = false,
  translations,
  ...props
}: SearchBoxProps) {
  const { status } = useInstantSearch();
  const { query, refine } = useSearchBox(
    { queryHook },
    { $$widgetType: 'ais.searchBox' }
  );
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  function setQuery(newQuery: string, isComposing = false) {
    setInputValue(newQuery);

    if (searchAsYouType && !(ignoreCompositionEvents && isComposing)) {
      refine(newQuery);
    }
  }

  function onReset() {
    setQuery('');

    if (!searchAsYouType) {
      refine('');
    }
  }

  function onChange(
    event: Parameters<NonNullable<SearchBoxUiComponentProps['onChange']>>[0]
  ) {
    setQuery(
      event.currentTarget.value,
      (event.nativeEvent as KeyboardEvent).isComposing
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!searchAsYouType) {
      refine(inputValue);
    }

    if (props.onSubmit) {
      props.onSubmit(event);
    }
  }

  // Track when the InstantSearch query changes to synchronize it with
  // the React state.
  // We bypass the state update if the input is focused to avoid concurrent
  // updates when typing.
  if (query !== inputValue && document.activeElement !== inputRef.current) {
    setInputValue(query);
  }

  const uiProps: UiProps = {
    inputRef,
    isSearchStalled: status === 'stalled',
    onChange,
    onReset,
    onSubmit,
    value: inputValue,
    translations: {
      submitButtonTitle: 'Submit the search query',
      resetButtonTitle: 'Clear the search query',
      ...translations,
    },
  };

  return <SearchBoxUiComponent {...props} {...uiProps} />;
}
