/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { createWidgetMixin } from '../widget';

const createFakeComponent = (props = {}) => ({
  render: () => null,
  ...props,
});

const createFakeIndexWidget = () => ({
  addWidgets: jest.fn(),
  removeWidgets: jest.fn(),
});

const createFakeInstance = () => ({
  addWidgets: jest.fn(),
  removeWidgets: jest.fn(),
  mainIndex: createFakeIndexWidget(),
  started: true,
});

describe('on root index', () => {
  it('adds a widget on create', () => {
    const instance = createFakeInstance();
    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };
    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector })],
      computed: {
        widgetParams() {
          return widgetParams;
        },
      },
    });

    mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
      },
    });

    expect(connector).toHaveBeenCalled();
    expect(factory).toHaveBeenCalledWith(widgetParams);
    expect(instance.mainIndex.addWidgets).toHaveBeenCalledWith([widget]);
  });

  it('removes a widget on destroy', () => {
    const instance = createFakeInstance();
    const widget = {
      render: () => {},
      dispose: () => {},
    };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector })],
    });
    const widgetParams = {
      attribute: 'brand',
    };

    const wrapper = mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
      },
      data: () => ({
        widgetParams,
      }),
    });

    expect(instance.mainIndex.addWidgets).toHaveBeenCalledWith([widget]);

    wrapper.destroy();

    expect(instance.mainIndex.removeWidgets).toHaveBeenCalledWith([widget]);
  });

  it('updates widget on widget params change', async () => {
    const instance = createFakeInstance();
    const widget = {
      render: () => {},
      dispose: () => {},
    };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };

    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector })],
      data: () => ({
        widgetParams,
      }),
    });

    const nextWidgetParams = {
      attribute: 'price',
    };

    const wrapper = mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
      },
    });

    // Simulate render
    await wrapper.setData({
      state: { items: [] },
    });

    expect(instance.mainIndex.addWidgets).toHaveBeenCalledTimes(1);
    expect(instance.mainIndex.addWidgets).toHaveBeenCalledWith([widget]);

    // Simulate widget params update
    await wrapper.setData({
      widgetParams: nextWidgetParams,
    });

    expect(wrapper.vm.state).toBe(null);

    expect(instance.mainIndex.removeWidgets).toHaveBeenCalledTimes(1);
    expect(instance.mainIndex.removeWidgets).toHaveBeenCalledWith([widget]);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(factory).toHaveBeenCalledWith(nextWidgetParams);

    expect(instance.mainIndex.addWidgets).toHaveBeenCalledTimes(2);
    expect(instance.mainIndex.addWidgets).toHaveBeenCalledWith([widget]);
  });

  it('updates local state on connector render', () => {
    const instance = createFakeInstance();
    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector })],
    });
    const widgetParams = {
      attribute: 'brand',
    };

    const state = {
      items: [],
    };

    const wrapper = mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
      },
      data: () => ({
        widgetParams,
      }),
    });

    // Simulate init
    connector.mock.calls[0][0](state, true);

    // Avoid to update the state on first render
    // otherwise we have a flash from empty state
    // to the next state
    expect(wrapper.vm.state).toBe(null);

    // Simulate render
    connector.mock.calls[0][0](state, false);

    expect(wrapper.vm.state).toEqual(state);
  });
});

describe('on child index', () => {
  it('adds a widget on create', () => {
    const instance = createFakeInstance();
    const indexWidget = createFakeIndexWidget();
    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };
    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector })],
      computed: {
        widgetParams() {
          return widgetParams;
        },
      },
    });

    mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => indexWidget,
      },
    });

    expect(connector).toHaveBeenCalled();
    expect(factory).toHaveBeenCalledWith(widgetParams);
    expect(indexWidget.addWidgets).toHaveBeenCalledWith([widget]);
  });

  it('removes a widget on destroy', () => {
    const instance = createFakeInstance();
    const indexWidget = createFakeIndexWidget();
    const widget = {
      render: () => {},
      dispose: () => {},
    };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector })],
    });
    const widgetParams = {
      attribute: 'brand',
    };

    const wrapper = mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => indexWidget,
      },
      data: () => ({
        widgetParams,
      }),
    });

    expect(indexWidget.addWidgets).toHaveBeenCalledWith([widget]);

    wrapper.destroy();

    expect(indexWidget.removeWidgets).toHaveBeenCalledWith([widget]);
  });

  it('updates widget on widget params change', async () => {
    const instance = createFakeInstance();
    const indexWidget = createFakeIndexWidget();
    const widget = {
      render: () => {},
      dispose: () => {},
    };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };

    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector })],
      data: () => ({
        widgetParams,
      }),
    });

    const nextWidgetParams = {
      attribute: 'price',
    };

    const wrapper = mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => indexWidget,
      },
    });

    // Simulate render
    await wrapper.setData({
      state: { items: [] },
    });

    expect(indexWidget.addWidgets).toHaveBeenCalledTimes(1);
    expect(indexWidget.addWidgets).toHaveBeenCalledWith([widget]);

    // Simulate widget params update
    await wrapper.setData({
      widgetParams: nextWidgetParams,
    });

    expect(wrapper.vm.state).toBe(null);

    expect(indexWidget.removeWidgets).toHaveBeenCalledTimes(1);
    expect(indexWidget.removeWidgets).toHaveBeenCalledWith([widget]);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(factory).toHaveBeenCalledWith(nextWidgetParams);

    expect(indexWidget.addWidgets).toHaveBeenCalledTimes(2);
    expect(indexWidget.addWidgets).toHaveBeenCalledWith([widget]);
  });

  it('updates local state on connector render', () => {
    const instance = createFakeInstance();
    const indexWidget = createFakeIndexWidget();
    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };

    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector })],
      data: () => ({
        widgetParams,
      }),
    });
    const state = {
      items: [],
    };

    const wrapper = mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => indexWidget,
      },
    });

    // Simulate init
    connector.mock.calls[0][0](state, true);

    // Avoid to update the state on first render
    // otherwise we have a flash from empty state
    // to the next state
    expect(wrapper.vm.state).toBe(null);

    // Simulate render
    connector.mock.calls[0][0](state, false);

    expect(wrapper.vm.state).toEqual(state);
  });
});

describe('general', () => {
  it('sets additional properties to widget', () => {
    const instance = createFakeInstance();
    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };
    const additionalProperties = { $$widgetType: 'ais.fakeWidget' };
    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector }, additionalProperties)],
      computed: {
        widgetParams() {
          return widgetParams;
        },
      },
    });

    mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
      },
    });

    expect(connector).toHaveBeenCalled();
    expect(factory).toHaveBeenCalledWith(widgetParams);
    expect(instance.mainIndex.addWidgets).toHaveBeenCalledTimes(1);
    expect(instance.mainIndex.addWidgets.mock.calls[0][0]).toEqual([
      {
        ...widget,
        ...additionalProperties,
      },
    ]);
  });

  it('sets additional properties to widget when it recreates', async () => {
    const instance = createFakeInstance();
    const widget = {
      render: () => {},
      dispose: () => {},
    };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };
    const additionalProperties = { $$widgetType: 'ais.fakeWidget' };

    const Test = createFakeComponent({
      mixins: [createWidgetMixin({ connector }, additionalProperties)],
      data: () => ({
        widgetParams,
      }),
    });

    const nextWidgetParams = {
      attribute: 'price',
    };

    const wrapper = mount(Test, {
      provide: {
        $_ais_instantSearchInstance: instance,
      },
    });

    // Simulate render
    await wrapper.setData({
      state: { items: [] },
    });

    expect(instance.mainIndex.addWidgets).toHaveBeenCalledTimes(1);
    expect(instance.mainIndex.addWidgets.mock.calls[0][0]).toEqual([
      {
        ...widget,
        ...additionalProperties,
      },
    ]);

    // Simulate widget params update
    await wrapper.setData({
      widgetParams: nextWidgetParams,
    });

    expect(wrapper.vm.state).toBe(null);

    expect(instance.mainIndex.removeWidgets).toHaveBeenCalledTimes(1);
    expect(instance.mainIndex.removeWidgets).toHaveBeenCalledWith([widget]);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(factory).toHaveBeenCalledWith(nextWidgetParams);

    expect(instance.mainIndex.addWidgets).toHaveBeenCalledTimes(2);
    expect(instance.mainIndex.addWidgets.mock.calls[1][0]).toEqual([
      {
        ...widget,
        ...additionalProperties,
      },
    ]);
  });
});
