/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow, mount } from 'enzyme';
import { createSerializer } from 'enzyme-to-json';
import React from 'react';

import { PanelProvider } from '../Panel';
import PanelCallbackHandler from '../PanelCallbackHandler';

expect.addSnapshotSerializer(createSerializer());
Enzyme.configure({ adapter: new Adapter() });

describe('PanelCallbackHandler', () => {
  it('expect to render', () => {
    const wrapper = mount(
      <PanelCallbackHandler canRefine>
        <div>Hello content</div>
      </PanelCallbackHandler>
    );

    expect(wrapper).toMatchInlineSnapshot(`
      <PanelWrapper
        canRefine={true}
      >
        <PanelCallbackHandler
          canRefine={true}
          setCanRefine={[Function]}
        >
          <div>
            Hello content
          </div>
        </PanelCallbackHandler>
      </PanelWrapper>
    `);
  });

  describe('didMount', () => {
    it('expect to call setCanRefine when the context is given', () => {
      const setCanRefine = jest.fn();

      mount(
        <PanelProvider value={setCanRefine}>
          <PanelCallbackHandler canRefine>
            <div>Hello content</div>
          </PanelCallbackHandler>
        </PanelProvider>
      );

      expect(setCanRefine).toHaveBeenCalledTimes(1);
      expect(setCanRefine).toHaveBeenCalledWith(true);
    });

    it('expect to not throw when the context is not given', () => {
      expect(() =>
        shallow(
          <PanelCallbackHandler canRefine>
            <div>Hello content</div>
          </PanelCallbackHandler>
        )
      ).not.toThrow();
    });
  });

  describe('didUpdate', () => {
    it('expect to call setCanRefine when the context is given', () => {
      const setCanRefine = jest.fn();

      const wrapper = mount(
        <PanelProvider value={setCanRefine}>
          <PanelCallbackHandler canRefine>
            <div>Hello content</div>
          </PanelCallbackHandler>
        </PanelProvider>
      );

      wrapper.setProps({
        children: (
          <PanelCallbackHandler canRefine={false}>
            <div>Hello content</div>
          </PanelCallbackHandler>
        ),
      });

      expect(setCanRefine).toHaveBeenCalledTimes(2);
      expect(setCanRefine).toHaveBeenLastCalledWith(false);
    });

    it('expect to not call setCanRefine when the nextProps is the same', () => {
      const setCanRefine = jest.fn();

      const wrapper = mount(
        <PanelProvider value={setCanRefine}>
          <PanelCallbackHandler canRefine>
            <div>Hello content</div>
          </PanelCallbackHandler>
        </PanelProvider>
      );

      wrapper.setProps({
        children: (
          <PanelCallbackHandler canRefine>
            <div>Hello content</div>
          </PanelCallbackHandler>
        ),
      });

      expect(setCanRefine).toHaveBeenCalledTimes(1);
    });

    it('expect to not throw when the context is not given', () => {
      expect(() => {
        const wrapper = shallow(
          <PanelCallbackHandler canRefine>
            <div>Hello content</div>
          </PanelCallbackHandler>
        );

        wrapper.setProps({ canRefine: false });
      }).not.toThrow();
    });
  });
});
