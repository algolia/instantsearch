/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */

import { mount } from '@instantsearch/testutils/enzyme';
import { act, render } from '@testing-library/preact';
import { h } from 'preact';

import createHelpers from '../../../lib/createHelpers';
import defaultTemplates from '../../../widgets/stats/defaultTemplates';
import Stats from '../Stats';

describe('Stats', () => {
  const cssClasses = {
    root: 'root',
    text: 'text',
  };

  it('should render <Template data= />', () => {
    const wrapper = mount(
      <Stats {...getProps()} templateProps={{ templates: defaultTemplates }} />
    );

    const defaultProps = {
      cssClasses,
      hasManyResults: true,
      hasNoResults: false,
      hasOneResult: false,
    };

    expect(wrapper.find('Template').props().data).toMatchObject(defaultProps);
    expect(wrapper).toMatchInlineSnapshot(`
      <div
        className="root"
      >
        <span
          className="text"
          dangerouslySetInnerHTML={
            {
              "__html": "1,234 results found in 42ms",
            }
          }
        />
        <span
          aria-atomic="true"
          aria-live="polite"
          className="ais-Stats-announcement"
          role="status"
          style={
            {
              "border": 0,
              "clip": "rect(0, 0, 0, 0)",
              "height": "1px",
              "margin": "-1px",
              "overflow": "hidden",
              "padding": 0,
              "position": "absolute",
              "whiteSpace": "nowrap",
              "width": "1px",
            }
          }
        />
      </div>
    `);
  });

  it('should render <Stats /> with custom CSS classes', () => {
    const { container } = render(
      <Stats
        {...getProps()}
        templateProps={{
          templates: defaultTemplates,
        }}
        cssClasses={{
          root: 'customRoot',
          text: 'customText',
        }}
      />
    );

    expect(container.querySelector('.customRoot')).toBeInTheDocument();
    expect(container.querySelector('.customText')).toBeInTheDocument();
  });

  it('should render sorted hits', () => {
    const { container } = render(
      <Stats
        {...getProps({ nbSortedHits: 150, areHitsSorted: true })}
        templateProps={{
          templates: defaultTemplates,
          templatesConfig: {
            helpers: createHelpers({}),
          },
        }}
      />
    );
    expect(container.querySelector('.text')).toMatchInlineSnapshot(`
      <span
        class="text"
      >
        150 relevant results sorted out of 1,234 found in 42ms
      </span>
    `);
  });

  it('should render 1 sorted hit', () => {
    const { container } = render(
      <Stats
        {...getProps({ nbSortedHits: 1, areHitsSorted: true })}
        templateProps={{
          templates: defaultTemplates,
          templatesConfig: {
            helpers: createHelpers({}),
          },
        }}
      />
    );
    expect(container.querySelector('.text')).toMatchInlineSnapshot(`
      <span
        class="text"
      >
        1 relevant result sorted out of 1,234 found in 42ms
      </span>
    `);
  });

  it('should render 0 sorted hit', () => {
    const { container } = render(
      <Stats
        {...getProps({ areHitsSorted: true })}
        templateProps={{
          templates: defaultTemplates,
          templatesConfig: {
            helpers: createHelpers({}),
          },
        }}
      />
    );
    expect(container.querySelector('.text')).toMatchInlineSnapshot(`
      <span
        class="text"
      >
        No relevant results sorted out of 1,234 found in 42ms
      </span>
    `);
  });

  it('announces the trimmed count after a debounce when results change', () => {
    jest.useFakeTimers();

    try {
      const { container, rerender } = render(
        <Stats {...getProps()} templateProps={{ templates: defaultTemplates }} />
      );

      const region = container.querySelector('.ais-Stats-announcement');

      // Initial results are not announced.
      expect(region).toHaveTextContent('');
      expect(region!.textContent).toBe('');

      rerender(
        <Stats
          {...getProps({ nbHits: 5 })}
          templateProps={{ templates: defaultTemplates }}
        />
      );

      // Still empty before the debounce elapses.
      expect(region!.textContent).toBe('');

      act(() => {
        jest.advanceTimersByTime(1400);
      });

      expect(region).toHaveTextContent('5 results');
    } finally {
      jest.useRealTimers();
    }
  });

  function getProps(extraProps = {}) {
    return {
      cssClasses,
      areHitsSorted: false,
      nbSortedHits: 0,
      hitsPerPage: 10,
      nbHits: 1234,
      nbPages: 124,
      page: 0,
      processingTimeMS: 42,
      query: 'a query',
      ...extraProps,
    };
  }
});
