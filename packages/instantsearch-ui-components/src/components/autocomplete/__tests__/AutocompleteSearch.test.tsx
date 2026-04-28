/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { createElement, createRef, Fragment } from 'preact';

import { createAutocompleteDetachedFormContainerComponent } from '../AutocompleteDetachedFormContainer';
import { createAutocompleteSearchComponent } from '../AutocompleteSearch';

const AutocompleteSearch = createAutocompleteSearchComponent({
  createElement,
  Fragment,
});

const AutocompleteDetachedFormContainer =
  createAutocompleteDetachedFormContainerComponent({
    createElement,
    Fragment,
  });

describe('AutocompleteSearch', () => {
  test('renders a back button and closes on click in detached mode', () => {
    const onCancel = jest.fn();
    const inputRef = createRef<HTMLInputElement>();
    const { container, getByTitle } = render(
      <AutocompleteSearch
        inputProps={{
          id: 'detached-search',
          ref: inputRef,
          onInput: jest.fn(),
        }}
        onClear={jest.fn()}
        query="iphone"
        isSearchStalled={false}
        onCancel={onCancel}
        isDetached={true}
        submitTitle="Close"
      />
    );

    userEvent.click(getByTitle('Close'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    // A dedicated back button is rendered – not the submit button
    expect(
      container.querySelector('.ais-AutocompleteBackButton')
    ).not.toBeNull();
    expect(container.querySelector('.ais-AutocompleteBackIcon')).not.toBeNull();
    // Submit button is hidden (label hidden), back button is separate
    expect(
      container.querySelector<HTMLLabelElement>('.ais-AutocompleteLabel')
        ?.hidden
    ).toBe(true);
    expect(
      container.querySelector('.ais-AutocompleteSubmitButton')
    ).not.toBeNull();
  });

  test('renders the submit button in non-detached mode', () => {
    const inputRef = createRef<HTMLInputElement>();
    const { container, getByTitle } = render(
      <AutocompleteSearch
        inputProps={{
          id: 'default-search',
          ref: inputRef,
          onInput: jest.fn(),
        }}
        onClear={jest.fn()}
        query=""
        isSearchStalled={false}
      />
    );

    expect(getByTitle('Submit').getAttribute('type')).toBe('submit');
    expect(
      container.querySelector('.ais-AutocompleteSubmitIcon')
    ).not.toBeNull();
    expect(container.querySelector('.ais-AutocompleteBackButton')).toBeNull();
    expect(container.querySelector('.ais-AutocompleteBackIcon')).toBeNull();
  });
});

describe('AutocompleteDetachedFormContainer', () => {
  test('renders children without a cancel button', () => {
    const { container, queryByText } = render(
      <AutocompleteDetachedFormContainer>
        <div>Search form</div>
      </AutocompleteDetachedFormContainer>
    );

    expect(queryByText('Search form')).not.toBeNull();
    expect(
      container.querySelector('.ais-AutocompleteDetachedCancelButton')
    ).toBeNull();
  });
});
