/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react/lib/ReactTestRenderer';

import RefinementList from './RefinementList';

describe('RefinementList', () => {
  it('default refinement list', () => {
    const tree = renderer.create(
      <RefinementList
        refine={() => null}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10},
          {value: 'black', count: 20},
          {value: 'blue', count: 30},
        ]}
        currentRefinement={['white']}
        selectedItems={['white']}
        limitMin={2}
        limitMax={4}
        showMore={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <RefinementList
        refine={() => null}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10},
          {value: 'black', count: 20},
          {value: 'blue', count: 30},
        ]}
        currentRefinement={[]}
        selectedItems={[]}
        translations={{
          showMore: ' display more',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
