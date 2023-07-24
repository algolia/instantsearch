/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow, mount } from 'enzyme';
import { createSerializer } from 'enzyme-to-json';
import React from 'react';

import Panel, { PanelConsumer } from '../Panel';

expect.addSnapshotSerializer(createSerializer());
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

  it('expect to expose context to its children', () => {
    let provided;
    const wrapper = mount(
      <Panel>
        <PanelConsumer>
          {(setCanRefine) => {
            provided = setCanRefine;
            return null;
          }}
        </PanelConsumer>
      </Panel>
    );

    expect(provided).toEqual(wrapper.instance().setCanRefine);
  });

  it('expect to render when setCanRefine is called', () => {
    const wrapper = mount(
      <Panel>
        <PanelConsumer>
          {(setCanRefine) => (
            <button onClick={() => setCanRefine(false)}>
              call setCanRefine
            </button>
          )}
        </PanelConsumer>
      </Panel>
    );

    expect(wrapper.state('canRefine')).toBe(true);
    expect(wrapper).toMatchSnapshot();

    // Simulate context call
    wrapper.find('button').simulate('click');

    expect(wrapper.state('canRefine')).toBe(false);
    expect(wrapper).toMatchSnapshot();
  });
});
