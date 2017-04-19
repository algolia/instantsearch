/* eslint-env jest, jasmine */

import React from 'react';
import {mount} from 'enzyme';

import Hits from './Hits';
import DefaultHitComponent from './DefaultHitComponent';
jest.unmock('./Hits');
jest.unmock('./DefaultHitComponent');

describe('Hits', () => {
  // @FIX: Triggers a warning https://github.com/facebook/react/issues/7240
  // Remove this comment once the issue is closed
  it('renders a default component when no itemComponent prop is provided', () => {
    const hits = [{objectID: 0}, {objectID: 1}, {objectID: 2}];
    const wrapper = mount(
      <Hits
        hits={hits}
      />
    );
    expect(wrapper.find(DefaultHitComponent).length).toBe(3);
    expect(wrapper.find(DefaultHitComponent).everyWhere((c, i) =>
      c.props().hit === hits[i]
    )).toBe(true);
  });

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
});
