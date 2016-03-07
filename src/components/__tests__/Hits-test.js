/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import Hits from '../Hits';
import Template from '../Template';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('Hits', () => {
  let renderer;
  let results;
  let templateProps;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
    results = {hits: []};
    templateProps = {};
  });

  it('render hits when present (item template)', () => {
    results = {hits: [{
      objectID: 'hello'
    }, {
      objectID: 'mom'
    }]};

    let props = {
      results,
      templateProps,
      cssClasses: {
        root: 'custom-root',
        item: 'custom-item',
        empty: 'custom-empty'
      }
    };
    renderer.render(<Hits {...props} />);
    let out = renderer.getRenderOutput();

    expect(out).toEqualJSX(
      <div className="custom-root">
        <Template
          data={results.hits[0]}
          key={results.hits[0].objectID}
          rootProps={{className: 'custom-item'}}
          templateKey="item"
        />
        <Template
          data={results.hits[1]}
          key={results.hits[1].objectID}
          rootProps={{className: 'custom-item'}}
          templateKey="item"
        />
      </div>
    );
  });

  it('render hits when present (allItems template)', () => {
    results = {hits: [{
      objectID: 'hello'
    }, {
      objectID: 'mom'
    }]};

    const templateProps2 = {
      ...templateProps,
      templates: {
        allItems: 'all items'
      }
    };

    let props = {
      results,
      templateProps: templateProps2,
      cssClasses: {
        root: 'custom-root',
        allItems: 'custom-item',
        empty: 'custom-empty'
      }
    };
    renderer.render(<Hits {...props} />);
    let out = renderer.getRenderOutput();

    expect(out).toEqualJSX(
      <Template
        data={results}
        rootProps={{className: 'custom-item'}}
        templateKey="allItems"
        {...templateProps2}
      />
    );
  });

  it('renders a specific template when no results', () => {
    results = {hits: []};

    let props = {
      results,
      templateProps,
      cssClasses: {
        root: 'custom-root',
        item: 'custom-item',
        empty: 'custom-empty'
      }
    };
    renderer.render(<Hits {...props} />);
    let out = renderer.getRenderOutput();

    expect(out).toEqualJSX(
      <Template
        data={results}
        rootProps={{className: 'custom-root custom-empty'}}
        templateKey="empty"
      />
    );
  });
});
