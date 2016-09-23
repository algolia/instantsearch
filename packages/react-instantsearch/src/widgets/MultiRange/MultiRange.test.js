/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react/lib/ReactTestRenderer';

import MultiRange from './MultiRange';

describe('RangeInput', () => {
  it('supports passing items values', () => {
    const tree = renderer.create(
      <MultiRange
        createURL={() => '#'}
        refine={() => null}
        items={[
          {label: 'label', value: '10:'},
          {label: 'label', value: '10:20'},
          {label: 'label', value: '20:30'},
          {label: 'label', value: '30:'},
        ]}
        selectedItem=""
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
          {label: 'label', value: '10:'},
          {label: 'label', value: '10:20'},
          {label: 'label', value: '20:30'},
          {label: 'label', value: '30:'},
        ]}
        selectedItem="10:20"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
