/* eslint-env jest, jasmine */

import React from 'react';
import {shallow} from 'enzyme';

import createHits from './createHits';
jest.unmock('./createHits');

import connect from 'algoliasearch-helper-provider/src/connect';
jest.mock('algoliasearch-helper-provider/src/connect', () => {
  let stateInput = {};
  const output = mapStateToProps => Composed => function Connected(props) {
    return <Composed {...mapStateToProps(stateInput)} {...props} />;
  };
  output.__setState = state => {
    stateInput = state;
  };
  return output;
});

function testConnect(hoc, input, testOutput) {
  function Dummy() {
    return <div />;
  }
  const Connected = hoc(Dummy);
  connect.__setState(input);
  const wrapper = shallow(<Connected />);
  testOutput(wrapper.find(Dummy).props());
}

describe('createHits', () => {
  it('provides the current hits to the component', () => {
    const hits = {};
    testConnect(createHits, {searchResults: {hits}}, props =>
      expect(props.hits).toBe(hits)
    );
  });
});
