import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PanelCallbackHandler from './PanelCallbackHandler';

Enzyme.configure({ adapter: new Adapter() });

describe('PanelCallbackHandler', () => {
  it('expect to render', () => {
    const props = {
      canRefine: true,
    };

    const wrapper = shallow(
      <PanelCallbackHandler {...props}>
        <div>Hello content</div>
      </PanelCallbackHandler>
    );

    expect(wrapper).toMatchSnapshot();
  });

  describe('willMount', () => {
    it('expect to call setCanRefine when the context is given', () => {
      const props = {
        canRefine: true,
      };

      const context = {
        setCanRefine: jest.fn(),
      };

      shallow(
        <PanelCallbackHandler {...props}>
          <div>Hello content</div>
        </PanelCallbackHandler>,
        { context }
      );

      expect(context.setCanRefine).toHaveBeenCalledTimes(1);
      expect(context.setCanRefine).toHaveBeenCalledWith(true);
    });

    it('expect to not throw when the context is not given', () => {
      const props = {
        canRefine: true,
      };

      const trigger = () =>
        shallow(
          <PanelCallbackHandler {...props}>
            <div>Hello content</div>
          </PanelCallbackHandler>
        );

      expect(() => trigger()).not.toThrow();
    });
  });

  describe('willReceiveProps', () => {
    it('expect to call setCanRefine when the context is given', () => {
      const props = {
        canRefine: true,
      };

      const context = {
        setCanRefine: jest.fn(),
      };

      const wrapper = shallow(
        <PanelCallbackHandler {...props}>
          <div>Hello content</div>
        </PanelCallbackHandler>,
        { context }
      );

      wrapper.setProps({ canRefine: false });

      expect(context.setCanRefine).toHaveBeenCalledTimes(2);
      expect(context.setCanRefine).toHaveBeenLastCalledWith(false);
    });

    it('expect to not call setCanRefine when the nextProps is the same', () => {
      const props = {
        canRefine: true,
      };

      const context = {
        setCanRefine: jest.fn(),
      };

      const wrapper = shallow(
        <PanelCallbackHandler {...props}>
          <div>Hello content</div>
        </PanelCallbackHandler>,
        { context }
      );

      wrapper.setProps({ canRefine: true });

      expect(context.setCanRefine).toHaveBeenCalledTimes(1);
    });

    it('expect to not throw when the context is not given', () => {
      const props = {
        canRefine: true,
      };

      const trigger = () => {
        const wrapper = shallow(
          <PanelCallbackHandler {...props}>
            <div>Hello content</div>
          </PanelCallbackHandler>
        );

        wrapper.setProps({ canRefine: false });
      };

      expect(() => trigger()).not.toThrow();
    });
  });
});
