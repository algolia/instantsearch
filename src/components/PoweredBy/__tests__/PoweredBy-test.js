/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import PoweredBy from '../PoweredBy';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('PoweredBy', () => {
  let renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render <PoweredBy className="pb" />', () => {
    let out = render({
      cssClasses: {
        root: 'pb-root',
        link: 'pb-link'
      },
      link: 'www.google.com'
    });
    expect(out).toEqualJSX(
    <div className="pb-root">
      Search by
      <a className="pb-link" href="www.google.com" target="_blank">Algolia</a>
    </div>);
  });

  function render(extraProps = {}) {
    renderer.render(<PoweredBy {...getProps(extraProps)} />);
    return renderer.getRenderOutput();
  }

  function getProps(extraProps = {}) {
    return {
      cssClasses: {},
      ...extraProps
    };
  }
});
