import {
  useEffect,
  useRef,
  useState,
  ChangeEvent,
  ComponentProps,
} from 'react';
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch-hooks';

import { ControlledSearchBox } from './ControlledSearchBox';

export type SearchBoxProps = ComponentProps<'div'> & UseSearchBoxProps;

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

  useEffect(() => {
    if (query !== value) {
      refine(value);
    }
    // We want to track when the value coming from the React state changes
    // to update the InstantSearch.js query, so we don't need to track the
    // InstantSearch.js query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, refine]);

  useEffect(() => {
    if (query !== value) {
      setValue(query);
    }
    // We want to track when the query coming from InstantSearch.js changes
    // to update the React state, so we don't need to track the state value.
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
