/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import Hits from '../Hits';
import Template from '../Template';

describe('Hits', () => {
  var renderer;
  var results;
  var templateProps;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
    results = {hits: []};
    templateProps = {};
  });

  it('render hits when present', () => {
    results = {hits: [{
      objectID: 'hello'
    }, {
      objectID: 'mom'
    }]};

    let props = {results, templateProps};
    renderer.render(<Hits {...props} />);
    let out = renderer.getRenderOutput();

    expect(out).toEqual(
      <div>
        <Template
          data={results.hits[0]}
          key={results.hits[0].objectID}
          templateKey="hit"
        />
        <Template
          data={results.hits[1]}
          key={results.hits[1].objectID}
          templateKey="hit"
        />
      </div>
    );
  });

  it('renders a specific template when no results', () => {
    results = {hits: []};

    let props = {results, templateProps};
    renderer.render(<Hits {...props} />);
    let out = renderer.getRenderOutput();

    expect(out).toEqual(
      <div>
        <Template
          data={results}
          templateKey="empty"
        />
      </div>
    );
  });
});
