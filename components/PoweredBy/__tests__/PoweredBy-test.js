/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import PoweredBy from '../PoweredBy';

import toEqualJSX from 'expect-to-equal-jsx';
expect.extend({toEqualJSX});

describe('PoweredBy', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render <PoweredBy className="pb" />', () => {
    var out = render({
      cssClasses: {
        root: 'pb-root',
        link: 'pb-link'
      }
    });
    expect(out).toEqualJSX(
    <div className="pb-root">
      Powered by
      <a className="pb-link" href="https://www.algolia.com/" target="_blank">Algolia</a>
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
