/** @jsx h */

import { h } from 'preact';
import { mount } from 'enzyme';
import Stats from '../Stats';
import defaultTemplates from '../../../widgets/stats/defaultTemplates';

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
