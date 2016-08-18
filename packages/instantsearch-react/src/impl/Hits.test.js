/* eslint-env jest, jasmine */

import React from 'react';
import {mount} from 'enzyme';
import renderer from 'react-test-renderer';

import Hits from './Hits';
jest.unmock('./Hits');
jest.unmock('../themeable');
jest.unmock('../propTypes');

describe('Hits', () => {
  it('accepts a itemComponent prop', () => {
    const hits = [{objectID: 0}, {objectID: 1}, {objectID: 2}];
    const Hit = () => null;
    const wrapper = mount(
      <Hits
        itemComponent={Hit}
        hits={hits}
      />
    );
    expect(wrapper.find(Hit).length).toBe(3);
    expect(wrapper.find(Hit).everyWhere((c, i) =>
      c.props().hit === hits[i]
    )).toBe(true);
  });

  it('applies theme', () => {
    const tree = renderer.create(
      <HitsPerPage
        values={[111, 333, 666]}
        theme={{
          label: 'HITS_LABEL',
          value: v => `HITS_VALUE_${v}`,
        }}
        hitsPerPage={111}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
