/* eslint-env jest, jasmine */

import React from 'react';
import {findDOMNode} from 'react-dom';
import {mount} from 'enzyme';
import renderer from 'react/lib/ReactTestRenderer';

import SearchBox from './SearchBox';
jest.unmock('./SearchBox');
jest.unmock('./utils');

let tree;

// In the current version of React, adding refs to elements will make
// ReactTestRenderer throw.
// Fixed in https://github.com/facebook/react/commit/caec8d5ce719997c15a4d586ceb771fcfbb5ccf7#diff-627ac9392c784e6a37db96c7c8efb219R66
// In the meantime, we can monkeypatch ReactTestComponent by devious means to
// add this patch... (pls don't fire me)
import {createInternalComponent} from 'react/lib/ReactHostComponent';
const dummy = createInternalComponent(<div />);
dummy.constructor.prototype.getPublicInstance = () => null;

describe('SearchBox', () => {
  it('applies its default props', () => {
    tree = renderer.create(
      <SearchBox />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('transfers the autoFocus prop to the underlying input element', () => {
    tree = renderer.create(
      <SearchBox autoFocus />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('treats its query prop as its input value', () => {
    // @TODO: Once ReactTestRenderer supports updating components, we'll be
    // able to use snapshots for this.
    const wrapper = mount(
      <SearchBox query="QUERY1" />
    );
    expect(wrapper.find('input').props().value).toBe('QUERY1');
    wrapper.setProps({
      query: 'QUERY2',
    });
    expect(wrapper.find('input').props().value).toBe('QUERY2');
    wrapper.unmount();
  });

  it('lets you customize its theme', () => {
    tree = renderer.create(
      <SearchBox
        theme={{
          root: 'ROOT',
          wrapper: 'WRAPPER',
          input: 'INPUT',
          submit: 'SUBMIT',
          reset: 'RESET',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('lets you customize its translations', () => {
    tree = renderer.create(
      <SearchBox
        translations={{
          submit: 'SUBMIT',
          reset: 'RESET',
          submitTitle: 'SUBMIT_TITLE',
          resetTitle: 'RESET_TITLE',
          placeholder: 'PLACEHOLDER',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('treats query as a default value when searchAsYouType=false', () => {
    const wrapper = mount(
      <SearchBox query="QUERY1" searchAsYouType={false} />
    );
    expect(wrapper.find('input').props().value).toBe('QUERY1');
    wrapper.find('input').simulate('change', {target: {value: 'QUERY2'}});
    expect(wrapper.find('input').props().value).toBe('QUERY2');
    wrapper.unmount();
  });

  it('overrides its value on query changes when searchAsYouType=false', () => {
    const wrapper = mount(
      <SearchBox query="QUERY1" searchAsYouType={false} />
    );
    expect(wrapper.find('input').props().value).toBe('QUERY1');
    wrapper.setProps({
      query: 'QUERY2',
    });
    expect(wrapper.find('input').props().value).toBe('QUERY2');
    wrapper.unmount();
  });

  it('refines its value on change when searchAsYouType=true', () => {
    const refine = jest.fn();
    const wrapper = mount(
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
    const wrapper = mount(
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
    const wrapper = mount(
      <SearchBox
        focusShortcuts={['s', 84]}
      />
    );
    const input = findDOMNode(wrapper.instance()).querySelector('input');
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
