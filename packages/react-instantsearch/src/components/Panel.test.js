import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Panel from './Panel';

Enzyme.configure({ adapter: new Adapter() });

describe('Panel', () => {
  it('expect to render', () => {
    const wrapper = shallow(
      <Panel>
        <div>Hello content</div>
      </Panel>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render with custom className', () => {
    const props = {
      className: 'ais-Panel-Breadcrumb',
    };

    const wrapper = shallow(
      <Panel {...props}>
        <div>Hello content</div>
      </Panel>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render without refinement', () => {
    const wrapper = shallow(
      <Panel>
        <div>Hello content</div>
      </Panel>
    );

    wrapper.setState({ canRefine: false });

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render with header', () => {
    const props = {
      header: <p>Header</p>,
    };

    const wrapper = shallow(
      <Panel {...props}>
        <div>Hello content</div>
      </Panel>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render with footer', () => {
    const props = {
      footer: <p>Footer</p>,
    };

    const wrapper = shallow(
      <Panel {...props}>
        <div>Hello content</div>
      </Panel>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to expose context to his children', () => {
    const wrapper = shallow(
      <Panel>
        <div>Hello content</div>
      </Panel>
    );

    expect(wrapper.instance().getChildContext()).toEqual({
      setCanRefine: wrapper.instance().setCanRefine,
    });
  });

  it('expect to render when setCanRefine is called', () => {
    const wrapper = shallow(
      <Panel>
        <div>Hello content</div>
      </Panel>
    );

    expect(wrapper.state('canRefine')).toBe(true);
    expect(wrapper).toMatchSnapshot();

    // Simulate context call
    wrapper
      .instance()
      .getChildContext()
      .setCanRefine(false);

    wrapper.update();

    expect(wrapper.state('canRefine')).toBe(false);
    expect(wrapper).toMatchSnapshot();
  });
});
