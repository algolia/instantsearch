import React from 'react';
import { shallow } from 'enzyme';
import Stats from '../Stats';

describe('Stats', () => {
  it('should render <Template data= />', () => {
    const cssClasses = {
      root: 'custom-root',
      text: 'custom-text',
    };
    const out = shallow(
      <Stats {...getProps()} cssClasses={cssClasses} templateProps={{}} />
    );

    const defaultProps = {
      hasManyResults: true,
      hasNoResults: false,
      hasOneResult: false,
    };
    expect(out.props().children.props.data).toMatchObject(defaultProps);
    expect(out).toMatchSnapshot();
  });

  function getProps(extraProps = {}) {
    return {
      cssClasses: {},
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
