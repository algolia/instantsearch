import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import ScrollTo from '../ScrollTo';

Enzyme.configure({ adapter: new Adapter() });

describe('ScrollTo', () => {
  it('expect to render', () => {
    const wrapper = shallow(
      <ScrollTo value={4} hasNotChanged={true}>
        content
      </ScrollTo>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to call scrollIntoView', () => {
    const wrapper = shallow(
      <ScrollTo value={4} hasNotChanged={true}>
        content
      </ScrollTo>
    );

    // Simulate ref
    wrapper.instance().el = {
      scrollIntoView: jest.fn(),
    };

    wrapper.setProps({ value: 5 });

    expect(wrapper.instance().el.scrollIntoView).toHaveBeenCalled();
  });

  it('expect to not call scrollIntoView when previous value do not have changed', () => {
    const wrapper = shallow(
      <ScrollTo value={4} hasNotChanged={true}>
        content
      </ScrollTo>
    );

    // Simulate ref
    wrapper.instance().el = {
      scrollIntoView: jest.fn(),
    };

    wrapper.setProps({ value: 4 });

    expect(wrapper.instance().el.scrollIntoView).not.toHaveBeenCalled();
  });

  it('expect to not call scrollIntoView when hasNotChanged is false', () => {
    const wrapper = shallow(
      <ScrollTo value={4} hasNotChanged={false}>
        content
      </ScrollTo>
    );

    // Simulate ref
    wrapper.instance().el = {
      scrollIntoView: jest.fn(),
    };

    wrapper.setProps({ value: 5 });

    expect(wrapper.instance().el.scrollIntoView).not.toHaveBeenCalled();
  });
});
