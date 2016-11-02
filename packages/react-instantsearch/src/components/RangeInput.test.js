/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react/lib/ReactTestRenderer';

import RangeInput from './RangeInput';

describe('RangeInput', () => {
  it('supports passing max/min values', () => {
    const tree = renderer.create(
      <RangeInput
        createURL={() => '#'}
        refine={() => null}
        min={0}
        max={100}
        currentRefinement={{min: 0, max: 100}}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <RangeInput
        createURL={() => '#'}
        refine={() => null}
        translations={{
          submit: 'SUBMIT',
          separator: 'SEPARATOR',
        }}
        min={0}
        max={100}
        currentRefinement={{min: 0, max: 100}}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
