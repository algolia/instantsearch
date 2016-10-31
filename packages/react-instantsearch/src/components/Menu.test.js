/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react/lib/ReactTestRenderer';

import Menu from './Menu';

describe('HierarchicalMenu', () => {
  it('default hierarchical menu', () => {
    const tree = renderer.create(
      <Menu
        refine={() => null}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10},
          {value: 'black', count: 20},
          {value: 'blue', count: 30},
          {value: 'green', count: 30},
          {value: 'red', count: 30},
        ]}
        currentRefinement=""
        selectedItems=""
        limitMin={2}
        limitMax={4}
        showMore={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <Menu
        refine={() => null}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10},
          {value: 'black', count: 20},
          {value: 'blue', count: 30},
          {value: 'green', count: 30},
          {value: 'red', count: 30},
        ]}
        currentRefinement=""
        selectedItems=""
        limitMin={2}
        limitMax={4}
        showMore={true}
        translations={{
          showMore: ' display more',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
