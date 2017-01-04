/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import SearchBox from './SearchBox';

describe('SearchBox', () => {
  it('applies its default props', () => {
    const tree = renderer.create(
      <SearchBox refine={() => null} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('transfers the autoFocus prop to the underlying input element', () => {
    const tree = renderer.create(
      <SearchBox refine={() => null} autoFocus />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('treats its query prop as its input value', () => {
    const inst = renderer.create(
      <SearchBox refine={() => null} currentRefinement="QUERY1" />
    );
    expect(inst.toJSON()).toMatchSnapshot();

    inst.update(
      <SearchBox refine={() => null} currentRefinement="QUERY2" />
    );
    expect(inst.toJSON()).toMatchSnapshot();
  });
  it('lets you customize its theme', () => {
    const tree = renderer.create(
      <SearchBox
        refine={() => null}
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
    const tree = renderer.create(
      <SearchBox
        refine={() => null}
        translations={{
          submit: 'SUBMIT',
          reset: 'RESET',
          resetTitle: 'RESET_TITLE',
          placeholder: 'PLACEHOLDER',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('treats query as a default value when searchAsYouType=false', () => {
    const wrapper = mount(
        <SearchBox refine={() => null} currentRefinement="QUERY1" searchAsYouType={false} />
      );
    expect(wrapper.find('input').props().value).toBe('QUERY1');
    wrapper.find('input').simulate('change', {target: {value: 'QUERY2'}});
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

  it('onSubmit behavior should be override if provided as props', () => {
    const onSubmit = jest.fn();
    const refine = jest.fn();
    const wrapper = mount(
      <SearchBox
        searchAsYouType={false}
        onSubmit={onSubmit}
        refine={refine}
      />
    );
    wrapper.find('form').simulate('submit');
    expect(onSubmit.mock.calls.length).toBe(1);
    expect(refine.mock.calls.length).toBe(0);
    wrapper.unmount();
  });

  it('focuses the input when one of the keys in focusShortcuts is pressed', () => {
    let input;
    mount(
      <SearchBox
        refine={() => null}
        focusShortcuts={['s', 84]}
        __inputRef={node => {
          input = node;
        }}
      />
    );

    input.focus = jest.fn();
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
