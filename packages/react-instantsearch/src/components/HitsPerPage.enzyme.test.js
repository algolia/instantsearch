/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';

import HitsPerPage from './HitsPerPage';

describe('HitsPerPage behavior', () => {
  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HitsPerPage
        createURL={() => '#'}
        items={[{value: 2, label: '2 hits per page'},
          {value: 4, label: '4 hits per page'},
          {value: 6, label: '6 hits per page'},
          {value: 8, label: '8 hits per page'}]}
        refine={refine}
        currentRefinement={111}
      />
    );

    const selectedValue = wrapper
      .find('.ais-HitsPerPage__root');
    expect(selectedValue.find('option').length).toBe(4);

    selectedValue.find('select').simulate('change', {target: {value: '6'}});

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual('6');
  });
});
