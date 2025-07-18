/* eslint-disable no-console */
/** @jsx h */

import { h, render } from 'preact';
import { useRef, useState } from 'preact/hooks';

import connectAutocomplete2 from '../../connectors/autocomplete2/connectAutocomplete2';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type { SearchBoxComponentCSSClasses } from '../../components/SearchBox/SearchBox';
import type {
  Autocomplete2ConnectorParams,
  Autocomplete2RenderState,
  Autocomplete2WidgetDescription,
} from '../../connectors/autocomplete2/connectAutocomplete2';
import type { WidgetFactory, Template, RendererOptions } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'search-box' });

export type SearchBoxTemplates = Partial<{
  /**
   * Template used for displaying the submit button. Can accept a function or a Hogan string.
   */
  submit: Template<{ cssClasses: SearchBoxComponentCSSClasses }>;
  /**
   * Template used for displaying the reset button. Can accept a function or a Hogan string.
   */
  reset: Template<{ cssClasses: SearchBoxComponentCSSClasses }>;
  /**
   * Template used for displaying the loading indicator. Can accept a function or a Hogan string.
   */
  loadingIndicator: Template<{ cssClasses: SearchBoxComponentCSSClasses }>;
}>;

export type SearchBoxCSSClasses = Partial<{
  /**
   * CSS class to add to the wrapping `<div>`
   */
  root: string | string[];
  /**
   * CSS class to add to the form
   */
  form: string | string[];
  /**
   * CSS class to add to the input.
   */
  input: string | string[];
  /**
   * CSS classes added to the submit button.
   */
  submit: string | string[];
  /**
   * CSS classes added to the submit icon.
   */
  submitIcon: string | string[];
  /**
   * CSS classes added to the reset button.
   */
  reset: string | string[];
  /**
   * CSS classes added to the reset icon.
   */
  resetIcon: string | string[];
  /**
   * CSS classes added to the loading indicator element.
   */
  loadingIndicator: string | string[];
  /**
   * CSS classes added to the loading indicator icon.
   */
  loadingIcon: string | string[];
}>;

export type Autocomplete2WidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget
   */
  container: string | HTMLElement;
  qsIndex: string;
};

const renderer =
  ({ containerNode }: { containerNode: HTMLElement }) =>
  ({
    submit,
    query,
  }: Autocomplete2RenderState &
    RendererOptions<Autocomplete2ConnectorParams>) => {
    render(
      <Autocomplete2
        query={query}
        submit={submit}
        items={['apple', 'iphone', 'samsung', 'nintendo']}
      />,
      containerNode
    );
  };

/**
 * The searchbox widget is used to let the user set a text based query.
 *
 * This is usually the  main entry point to start the search in an instantsearch context. For that
 * reason is usually placed on top, and not hidden so that the user can start searching right
 * away.
 *
 */
export type Autocomplete2Widget = WidgetFactory<
  Autocomplete2WidgetDescription & { $$widgetType: 'ais.autocomplete2' },
  Autocomplete2ConnectorParams,
  Autocomplete2WidgetParams
>;

const autocomplete2: Autocomplete2Widget = function autocomplete2(
  widgetParams
) {
  const { container } = widgetParams || {};
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = renderer({
    containerNode,
  });

  const makeWidget = connectAutocomplete2(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({}),
    $$widgetType: 'ais.autocomplete2',
  };
};

export default autocomplete2;

function Autocomplete2({
  query,
  submit,
  items,
}: Partial<Autocomplete2RenderState> & { items: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [innerQuery, setInnerQuery] = useState(query);
  const [hasFocus, setHasFocus] = useState(false);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const onInput = (event: Event) => {
    setInnerQuery((event.target as HTMLInputElement).value);
  };

  const onChange = (event: Event) => {
    event.preventDefault();
    if (activeItemId === null) {
      return;
    }
    const newQuery = items[activeItemId];
    setInnerQuery(newQuery);
    submit(newQuery);
    inputRef.current?.blur();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      console.log('---', activeItemId, event.key);
      setActiveItemId((prev) => {
        if (prev === null) return 0;
        if (event.key === 'ArrowDown') {
          return prev + 1;
        } else if (event.key === 'ArrowUp') {
          return prev - 1;
        }
        return prev;
      });
    }
  };

  const updateFocus = (event: FocusEvent) => {
    setHasFocus(event.type === 'focus');
    if (event.type === 'blur') {
      setActiveItemId(null);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="search"
        value={innerQuery}
        onKeyDown={onKeyDown}
        onInput={onInput}
        onChange={onChange}
        onFocus={updateFocus}
        onBlur={updateFocus}
      />
      {/* DROPDOWN */}
      <div
        style={{
          display: hasFocus ? 'block' : 'none',
          border: '1px solid #ccc',
          padding: '24px',
          position: 'absolute',
          backgroundColor: 'white',
          zIndex: 1000,
        }}
      >
        <ul style={{ padding: 0, margin: 0 }}>
          {items.map((item, index) => (
            <li
              key={index}
              className={`ais-Autocomplete2-Item ${
                activeItemId === index ? 'active' : ''
              }`}
              style={{
                fontWeight: activeItemId === index ? 'bold' : 'normal',
                listStyleType: 'none',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
