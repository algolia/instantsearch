/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react/lib/ReactTestRenderer';

import Range from './Range';

describe('Range', () => {
  it('supports passing max/min values', () => {
    const tree = renderer.create(
      <Range
        createURL={() => '#'}
        refine={() => null}
        min={0}
        max={100}
        step={4}
        value={{min: 0, max: 100}}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
