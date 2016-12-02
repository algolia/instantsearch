/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import HierarchicalMenu from './HierarchicalMenu';

describe('HierarchicalMenu', () => {
  it('default hierarchical menu', () => {
    const tree = renderer.create(
      <HierarchicalMenu
        refine={() => null}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10, label: 'white',
            items: [{value: 'white1', label: 'white1', count: 3}, {value: 'white2', label: 'white2', count: 4}]},
          {value: 'black', count: 20, label: 'black'},
          {value: 'blue', count: 30, label: 'blue'},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <HierarchicalMenu
        refine={() => null}
        createURL={() => '#'}
        items={[
          {value: 'white', count: 10, label: 'white',
            items: [{value: 'white1', label: 'white1', count: 3}, {value: 'white2', label: 'white2', count: 4}]},
          {value: 'black', count: 20, label: 'black'},
          {value: 'blue', count: 30, label: 'blue'},
        ]}
        translations={{
          showMore: ' display more',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
