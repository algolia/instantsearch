import React, { useRef, useState } from 'react';
import { useSearchBox } from 'react-instantsearch-core';

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
    translations?: Partial<UiProps['translations']>;
  };

export function SearchBox({
  queryHook,
  searchAsYouType = true,
  translations,
  ...props
}: SearchBoxProps) {
  const { query, refine, isSearchStalled } = useSearchBox(
    { queryHook },
    { $$widgetType: 'ais.searchBox' }
  );
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  function setQuery(newQuery: string) {
    setInputValue(newQuery);

    if (searchAsYouType) {
      refine(newQuery);
    }
  }

  function onReset() {
    setQuery('');

    if (!searchAsYouType) {
      refine('');
    }
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.currentTarget.value);
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
    isSearchStalled,
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
