/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react/lib/ReactTestRenderer';

import MultiRange from './MultiRange';

describe('MultiRange', () => {
  it('supports passing items values', () => {
    const tree = renderer.create(
      <MultiRange
        createURL={() => '#'}
        refine={() => null}
        items={[
          {label: 'label1', value: '10:', isRefined: false},
          {label: 'label2', value: '10:20', isRefined: false},
          {label: 'label3', value: '20:30', isRefined: false},
          {label: 'label4', value: '30:', isRefined: false},
        ]}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('supports having a selected item', () => {
    const tree = renderer.create(
      <MultiRange
        createURL={() => '#'}
        refine={() => null}
        items={[
          {label: 'label1', value: '10:', isRefined: false},
          {label: 'label2', value: '10:20', isRefined: true},
          {label: 'label3', value: '20:30', isRefined: false},
          {label: 'label4', value: '30:', isRefined: false},
        ]}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
