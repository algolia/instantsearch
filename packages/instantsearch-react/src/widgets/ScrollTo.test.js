/* eslint-env jest, jasmine */

import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';

import ScrollTo from './ScrollTo';
jest.unmock('./ScrollTo');
jest.mock('react-algoliasearch-helper', () => ({
  connect: mapStateToProps => Composed => props =>
    <Composed {...props} {...mapStateToProps(props.__state)} />,
}));

const DEFAULT_STATE = {searchParameters: {page: 0}};

describe('ScrollTo', () => {
  it('expects a single child', () => {
    expect(() =>
      mount(<ScrollTo __state={DEFAULT_STATE}/>)
    ).toThrow();
    expect(() =>
      mount(<ScrollTo __state={DEFAULT_STATE}><div/><div/></ScrollTo>)
    ).toThrow();
    expect(() =>
      mount(<ScrollTo __state={DEFAULT_STATE}><div/></ScrollTo>)
    ).not.toThrow();
  });

  it('scrolls the page to its DOM node on page change', () => {
    const wrapper = mount(
      <ScrollTo
        __state={{
          searchParameters: {page: 0},
        }}
      >
        <div/>
      </ScrollTo>
    );
    const node = ReactDOM.findDOMNode(wrapper.instance());
    node.scrollIntoView = jest.fn();
    wrapper.setProps({
      __state: {searchParameters: {page: 1}},
    });
    expect(node.scrollIntoView.mock.calls.length).toBe(1);
    wrapper.setProps({
      __state: {searchParameters: {page: 2}},
    });
    expect(node.scrollIntoView.mock.calls.length).toBe(2);
    wrapper.update();
    expect(node.scrollIntoView.mock.calls.length).toBe(2);
  });
});
