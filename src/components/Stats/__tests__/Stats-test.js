import React from 'react';
import { shallow } from 'enzyme';
import Stats from '../Stats';

describe('Stats', () => {
  it('should render <Template data= />', () => {
    const cssClasses = {
      root: 'custom-root',
      text: 'custom-text',
    };
    const props = getProps();
    const out = shallow(
      <Stats {...props} cssClasses={cssClasses} templateProps={{}} />
    );

    expect(out.props().children.props.data).toEqual(props.data);
    expect(out).toMatchSnapshot();
  });

  function getProps(extraProps = {}) {
    return {
      cssClasses: {},
      data: {
        hasManyResults: true,
        hasOneResult: false,
        hasNoResults: false,
        hitsPerPage: 10,
        nbHits: 1234,
        nbPages: 124,
        page: 0,
        processingTimeMS: 42,
        query: 'a query',
      },
      ...extraProps,
    };
  }
});
