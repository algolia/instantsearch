/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { createElement, createRef, Fragment } from 'preact';

import { createAutocompleteDetachedFormContainerComponent } from '../AutocompleteDetachedFormContainer';
import { createAutocompleteDetachedSearchButtonComponent } from '../AutocompleteDetachedSearchButton';
import { createAutocompletePanelComponent } from '../AutocompletePanel';
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

  test('merges custom classNames with default ais-* classes', () => {
    const inputRef = createRef<HTMLInputElement>();
    const { container } = render(
      <AutocompleteSearch
        inputProps={{
          id: 'classnames-search',
          ref: inputRef,
          onInput: jest.fn(),
        }}
        onClear={jest.fn()}
        query="test"
        isSearchStalled={false}
        classNames={{
          form: 'custom-form',
          input: 'custom-input',
          submitButton: 'custom-submit',
          resetButton: 'custom-clear',
        }}
      />
    );

    expect(container.querySelector('.ais-AutocompleteForm')).toHaveClass(
      'custom-form'
    );
    expect(container.querySelector('.ais-AutocompleteInput')).toHaveClass(
      'custom-input'
    );
    expect(
      container.querySelector('.ais-AutocompleteSubmitButton')
    ).toHaveClass('custom-submit');
    expect(
      container.querySelector('.ais-AutocompleteClearButton')
    ).toHaveClass('custom-clear');
  });

  test('applies classNames to all elements including detached and AI mode', () => {
    const inputRef = createRef<HTMLInputElement>();
    const { container } = render(
      <AutocompleteSearch
        inputProps={{
          id: 'full-classnames',
          ref: inputRef,
          onInput: jest.fn(),
        }}
        onClear={jest.fn()}
        query="test"
        isSearchStalled={false}
        onCancel={jest.fn()}
        isDetached={true}
        onAiModeClick={jest.fn()}
        classNames={{
          form: 'c-form',
          inputWrapperPrefix: 'c-prefix',
          backButton: 'c-back',
          backButtonIcon: 'c-back-icon',
          label: 'c-label',
          submitButton: 'c-submit',
          submitButtonIcon: 'c-submit-icon',
          loadingIndicator: 'c-loading',
          loadingIndicatorIcon: 'c-loading-icon',
          inputWrapper: 'c-input-wrapper',
          input: 'c-input',
          inputWrapperSuffix: 'c-suffix',
          resetButton: 'c-clear',
          resetButtonIcon: 'c-clear-icon',
          aiModeButton: 'c-ai',
          aiModeButtonIcon: 'c-ai-icon',
          aiModeButtonLabel: 'c-ai-label',
        }}
      />
    );

    expect(container.querySelector('.ais-AutocompleteForm')).toHaveClass(
      'c-form'
    );
    expect(
      container.querySelector('.ais-AutocompleteInputWrapperPrefix')
    ).toHaveClass('c-prefix');
    expect(container.querySelector('.ais-AutocompleteBackButton')).toHaveClass(
      'c-back'
    );
    expect(container.querySelector('.ais-AutocompleteBackIcon')).toHaveClass(
      'c-back-icon'
    );
    expect(container.querySelector('.ais-AutocompleteLabel')).toHaveClass(
      'c-label'
    );
    expect(
      container.querySelector('.ais-AutocompleteSubmitButton')
    ).toHaveClass('c-submit');
    expect(
      container.querySelector('.ais-AutocompleteSubmitIcon')
    ).toHaveClass('c-submit-icon');
    expect(
      container.querySelector('.ais-AutocompleteLoadingIndicator')
    ).toHaveClass('c-loading');
    expect(
      container.querySelector('.ais-AutocompleteLoadingIcon')
    ).toHaveClass('c-loading-icon');
    expect(
      container.querySelector('.ais-AutocompleteInputWrapper')
    ).toHaveClass('c-input-wrapper');
    expect(container.querySelector('.ais-AutocompleteInput')).toHaveClass(
      'c-input'
    );
    expect(
      container.querySelector('.ais-AutocompleteInputWrapperSuffix')
    ).toHaveClass('c-suffix');
    expect(
      container.querySelector('.ais-AutocompleteClearButton')
    ).toHaveClass('c-clear');
    expect(
      container.querySelector('.ais-AutocompleteClearIcon')
    ).toHaveClass('c-clear-icon');
    expect(container.querySelector('.ais-AiModeButton')).toHaveClass('c-ai');
    expect(container.querySelector('.ais-AiModeButton-icon')).toHaveClass(
      'c-ai-icon'
    );
    expect(container.querySelector('.ais-AiModeButton-label')).toHaveClass(
      'c-ai-label'
    );
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

describe('AutocompletePanel', () => {
  const AutocompletePanel = createAutocompletePanelComponent({
    createElement,
    Fragment,
  });

  test('merges custom classNames with default ais-* classes', () => {
    const { container } = render(
      <AutocompletePanel
        id="panel"
        role="grid"
        aria-labelledby="input"
        hidden={false}
        classNames={{ root: 'custom-panel', layout: 'custom-layout' }}
      >
        <div>results</div>
      </AutocompletePanel>
    );

    expect(container.querySelector('.ais-AutocompletePanel')).toHaveClass(
      'custom-panel'
    );
    expect(
      container.querySelector('.ais-AutocompletePanelLayout')
    ).toHaveClass('custom-layout');
  });

  test('applies open classNames when panel is visible', () => {
    const { container } = render(
      <AutocompletePanel
        id="panel"
        role="grid"
        aria-labelledby="input"
        hidden={false}
        classNames={{ open: 'custom-open' }}
      >
        <div>results</div>
      </AutocompletePanel>
    );

    expect(container.querySelector('.ais-AutocompletePanel')).toHaveClass(
      'custom-open'
    );
  });

  test('does not apply open classNames when panel is hidden', () => {
    const { container } = render(
      <AutocompletePanel
        id="panel"
        role="grid"
        aria-labelledby="input"
        hidden={true}
        classNames={{ open: 'custom-open' }}
      >
        <div>results</div>
      </AutocompletePanel>
    );

    expect(
      container.querySelector('.ais-AutocompletePanel')
    ).not.toHaveClass('custom-open');
  });
});

describe('AutocompleteDetachedSearchButton', () => {
  const AutocompleteDetachedSearchButton =
    createAutocompleteDetachedSearchButtonComponent({
      createElement,
      Fragment,
    });

  test('applies classNames to search and clear icons', () => {
    const { container } = render(
      <AutocompleteDetachedSearchButton
        query="test"
        onClick={jest.fn()}
        onClear={jest.fn()}
        translations={{
          detachedCancelButtonText: 'Cancel',
          detachedSearchButtonTitle: 'Search',
          detachedClearButtonTitle: 'Clear',
        }}
        classNames={{
          detachedSearchButtonSearchIcon: 'custom-search-icon',
          detachedSearchButtonClearIcon: 'custom-clear-icon',
        }}
      />
    );

    expect(
      container.querySelector('.ais-AutocompleteDetachedSearchIcon')
    ).toHaveClass('custom-search-icon');
    expect(
      container.querySelector('.ais-AutocompleteClearIcon')
    ).toHaveClass('custom-clear-icon');
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
