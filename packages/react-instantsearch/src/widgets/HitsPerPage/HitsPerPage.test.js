/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react/lib/ReactTestRenderer';

import HitsPerPage from './HitsPerPage';


describe('HitsPerPage', () => {
  it('supports passing number items', () => {
    const tree = renderer.create(
      <HitsPerPage
        createURL={() => '#'}
        refine={() => null}
        items={[111, 333, 666]}
        hitsPerPage={111}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('supports passing object items', () => {
    const tree = renderer.create(
      <HitsPerPage
        createURL={() => '#'}
        refine={() => null}
        items={[
          {label: '111 items', value: 111},
          {label: '333 items', value: 333},
          {label: '666 items', value: 666},
        ]}
        hitsPerPage={111}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <HitsPerPage
        createURL={() => '#'}
        refine={() => null}
        items={[111, 333, 666]}
        translations={{
          label: 'HITS_LABEL',
          value: v => `HITS_VALUE_${v}`,
        }}
        hitsPerPage={111}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
