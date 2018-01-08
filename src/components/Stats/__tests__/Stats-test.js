import React from 'react';
import { shallow } from 'enzyme';
import { RawStats as Stats } from '../Stats';

describe('Stats', () => {
  it('should render <Template data= />', () => {
    const out = shallow(<Stats {...getProps()} templateProps={{}} />);

    const defaultProps = {
      cssClasses: {},
      hasManyResults: true,
      hasNoResults: false,
      hasOneResult: false,
    };
    expect(out.props().data).toMatchObject(defaultProps);
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
