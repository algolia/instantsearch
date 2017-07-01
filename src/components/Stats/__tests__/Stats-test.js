import React from 'react';
import expect from 'expect';
import {createRenderer} from 'react-test-renderer/shallow';
import {RawStats as Stats} from '../Stats';
import Template from '../../Template';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('Stats', () => {
  let renderer;

  beforeEach(() => {
    renderer = createRenderer();
  });

  it('should render <Template data= />', () => {
    const out = render();
    const defaultProps = {
      cssClasses: {},
      hasManyResults: true,
      hasNoResults: false,
      hasOneResult: false,
    };
    expect(out).toEqualJSX(
      <Template
        data={getProps(defaultProps)}
        templateKey="body"
      />
    );
  });

  function render(extraProps = {}) {
    const props = getProps(extraProps);
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
      ...extraProps,
    };
  }
});
