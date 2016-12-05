/* eslint-env jest, jasmine */

// @TODO re-include this test in the normal .test.js
// when React 15.4 is out: https://github.com/facebook/react/issues/7386

import React from 'react';
import {mount} from 'enzyme';

import SearchBox from './SearchBox';

let wrapper;

// This is in a separate file as react-dom and react-test-renderer don't play
// nice with each other. Once React hits 15.4.0 this issue should be resolved
// and the tests merged back together.
describe('SearchBox', () => {
  it('treats query as a default value when searchAsYouType=false', () => {
    wrapper = mount(
      <SearchBox refine={() => null} currentRefinement="QUERY1" searchAsYouType={false} />
    );
    expect(wrapper.find('input').props().value).toBe('QUERY1');
    wrapper.find('input').simulate('change', {target: {value: 'QUERY2'}});
    expect(wrapper.find('input').props().value).toBe('QUERY2');
    wrapper.unmount();
  });

  it('refines its value on change when searchAsYouType=true', () => {
    const refine = jest.fn();
    wrapper = mount(
      <SearchBox
        searchAsYouType
        refine={refine}
      />
    );
    wrapper.find('input').simulate('change', {target: {value: 'hello'}});
    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toBe('hello');
    wrapper.unmount();
  });

  it('only refines its query on submit when searchAsYouType=false', () => {
    const refine = jest.fn();
    wrapper = mount(
      <SearchBox
        searchAsYouType={false}
        refine={refine}
      />
    );
    wrapper.find('input').simulate('change', {target: {value: 'hello'}});
    expect(refine.mock.calls.length).toBe(0);
    wrapper.find('form').simulate('submit');
    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toBe('hello');
    wrapper.unmount();
  });

  it('focuses the input when one of the keys in focusShortcuts is pressed', () => {
    let input;
    wrapper = mount(
      <SearchBox
        refine={() => null}
        focusShortcuts={['s', 84]}
        __inputRef={node => {
          input = node;
        }}
      />
    );

    input.focus = jest.fn();
    // Note that all our `render.create` made components aren't unmounted
    // (the API hasn't made it in yet) so they will also receive the keydown
    // event. Events for everyone!
    const event1 = new KeyboardEvent('keydown', {keyCode: 82});
    document.dispatchEvent(event1);
    expect(input.focus.mock.calls.length).toBe(0);
    const event2 = new KeyboardEvent('keydown', {keyCode: 83});
    document.dispatchEvent(event2);
    expect(input.focus.mock.calls.length).toBe(1);
    const event3 = new KeyboardEvent('keydown', {keyCode: 84});
    document.dispatchEvent(event3);
    expect(input.focus.mock.calls.length).toBe(2);
  });
});
