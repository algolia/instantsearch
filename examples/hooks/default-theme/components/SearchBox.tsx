import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch-hooks';

import { ControlledSearchBox } from './ControlledSearchBox';

export type SearchBoxProps = React.ComponentProps<'div'> & UseSearchBoxProps;

export function SearchBox(props: SearchBoxProps) {
  const { query, refine, isSearchStalled } = useSearchBox(props);
  const [value, setValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  function onReset() {
    setValue('');
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.currentTarget.value);
  }

  // Track when the value coming from the React state changes to synchronize
  // it with InstantSearch.
  useEffect(() => {
    if (query !== value) {
      refine(value);
    }
    // We don't want to track when the InstantSearch query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, refine]);

  // Track when the InstantSearch query changes to synchronize it with
  // the React state.
  useEffect(() => {
    // We bypass the state update if the input is focused to avoid concurrent
    // updates when typing.
    if (document.activeElement !== inputRef.current && query !== value) {
      setValue(query);
    }
    // We don't want to track when the React state value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <ControlledSearchBox
      className={props.className}
      inputRef={inputRef}
      isSearchStalled={isSearchStalled}
      onChange={onChange}
      onReset={onReset}
      placeholder={props.placeholder}
      value={value}
    />
  );
}
