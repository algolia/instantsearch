/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import Menu from './Menu';

describe('Menu', () => {
  it('default menu', () => {
    const tree = renderer.create(
      <Menu
        refine={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: 'white', count: 10, isRefined: false},
          {label: 'black', value: 'black', count: 20, isRefined: false},
          {label: 'blue', value: 'blue', count: 30, isRefined: false},
          {label: 'green', value: 'green', count: 30, isRefined: false},
          {label: 'red', value: 'red', count: 30, isRefined: false},
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
      <Menu
        refine={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: 'white', count: 10, isRefined: false},
          {label: 'black', value: 'black', count: 20, isRefined: false},
          {label: 'blue', value: 'blue', count: 30, isRefined: false},
          {label: 'green', value: 'green', count: 30, isRefined: false},
          {label: 'red', value: 'red', count: 30, isRefined: false},
        ]}
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
