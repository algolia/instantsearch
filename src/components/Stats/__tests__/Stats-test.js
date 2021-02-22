/** @jsx h */

import { h } from 'preact';
import { mount } from 'enzyme';
import Stats from '../Stats';
import defaultTemplates from '../../../widgets/stats/defaultTemplates';
import createHelpers from '../../../lib/createHelpers';

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
    expect(wrapper).toMatchSnapshot();
  });

  it('should render <Stats /> with custom CSS classes', () => {
    const wrapper = mount(
      <Stats
        templateProps={{
          templates: defaultTemplates,
        }}
        nbHits={1}
        cssClasses={cssClasses}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should render sorted hits', () => {
    const wrapper = mount(
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
    expect(wrapper.find('.text')).toMatchInlineSnapshot(`
      <span
        className="text"
        dangerouslySetInnerHTML={
          Object {
            "__html": "150 relevant results sorted out of 1,234 found in 42ms",
          }
        }
      />
    `);
  });

  it('should render 1 sorted hit', () => {
    const wrapper = mount(
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
    expect(wrapper.find('.text')).toMatchInlineSnapshot(`
      <span
        className="text"
        dangerouslySetInnerHTML={
          Object {
            "__html": "1 relevant result sorted out of 1,234 found in 42ms",
          }
        }
      />
    `);
  });

  it('should render 0 sorted hit', () => {
    const wrapper = mount(
      <Stats
        {...getProps({ nbSortedHits: 0, areHitsSorted: true })}
        templateProps={{
          templates: defaultTemplates,
          templatesConfig: {
            helpers: createHelpers({}),
          },
        }}
      />
    );
    expect(wrapper.find('.text')).toMatchInlineSnapshot(`
      <span
        className="text"
        dangerouslySetInnerHTML={
          Object {
            "__html": "No relevant results sorted out of 1,234 found in 42ms",
          }
        }
      />
    `);
  });

  function getProps(extraProps = {}) {
    return {
      cssClasses,
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
