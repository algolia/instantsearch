/** @jsx h */

import { h } from 'preact';
import { mount } from 'enzyme';
import Stats from '../Stats';
import defaultTemplates from '../../../widgets/stats/defaultTemplates';
import createHelpers from '../../../lib/createHelpers';
import { render } from '@testing-library/preact';
import { ReactElementLike } from 'prop-types';

describe('Stats', () => {
  const cssClasses = {
    root: 'root',
    text: 'text',
  };

  it('should render <Template data= />', () => {
    const wrapper = mount(
      (
        <Stats
          {...getProps()}
          templateProps={{ templates: defaultTemplates }}
        />
      ) as ReactElementLike
    );

    const defaultProps = {
      cssClasses,
      hasManyResults: true,
      hasNoResults: false,
      hasOneResult: false,
    };

    expect(wrapper.find('Template').props().data).toMatchObject(defaultProps);
    expect(wrapper).toMatchInlineSnapshot(`
      Array [
        <div
          className="root"
        >
          Array [
            <span
              className="text"
              dangerouslySetInnerHTML={
                Object {
                  "__html": "results found in 42ms",
                }
              }
            />,
          ]
        </div>,
      ]
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
