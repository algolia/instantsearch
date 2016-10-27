/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react/lib/ReactTestRenderer';

import RangeRatings from './RangeRatings';

describe('RangeRatings', () => {
  it('supports passing max/min values', () => {
    const tree = renderer.create(
      <RangeRatings
        createURL={() => '#'}
        refine={() => null}
        min={1}
        max={5}
        value={{min: 1, max: 5}}
        count={[{value: '1', count: 1},
          {value: '2', count: 2},
          {value: '3', count: 3},
          {value: '4', count: 4},
          {value: '5', count: 5}]}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <RangeRatings
        createURL={() => '#'}
        refine={() => null}
        translations={{
          ratingLabel: ' & Up',
        }}
        min={1}
        max={5}
        value={{min: 1, max: 5}}
        count={[{value: '1', count: 1},
          {value: '2', count: 2},
          {value: '3', count: 3},
          {value: '4', count: 4},
          {value: '5', count: 5}]}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
