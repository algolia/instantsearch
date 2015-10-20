/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import Stats from '../Stats';
import Template from '../../Template';

describe('Stats', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });


  it('should render <Template data= />', () => {
    var out = render();
    var defaultProps = {
      cssClasses: {},
      hasManyResults: true,
      hasNoResults: false,
      hasOneResult: false
    };
    expect(out).toEqualJSX(
      <Template
        data={getProps(defaultProps)}
        templateKey="body"
      />
    );
  });

  function render(extraProps = {}) {
    var props = getProps(extraProps);
    renderer.render(<Stats {...props} templateProps={{}} />);
    return renderer.getRenderOutput();
  }

  function getProps(extraProps = {}) {
    return {
      cssClasses: {},
      hitsPerPage: 10,
      nbHits: 1234,
      nbPages: 124,
      page: 0,
      processingTimeMS: 42,
      query: 'a query',
      ...extraProps
    };
  }
});
