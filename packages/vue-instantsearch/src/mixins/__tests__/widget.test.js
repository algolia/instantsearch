import { mount, createLocalVue } from '@vue/test-utils';
import { createWidgetMixin } from '../widget';

const createFakeComponent = localVue =>
  localVue.component('Test', {
    render: () => null,
  });

const createFakeInstance = () => ({
  addWidgets: jest.fn(),
  removeWidgets: jest.fn(),
  started: true,
});

const createFakeIndexWidget = () => ({
  addWidgets: jest.fn(),
  removeWidgets: jest.fn(),
});

describe('on root index', () => {
  it('adds a widget on create', () => {
    const localVue = createLocalVue();
    const instance = createFakeInstance();
    const Test = createFakeComponent(localVue);

    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };

    mount(Test, {
      mixins: [createWidgetMixin({ connector })],
      provide: {
        $_ais_instantSearchInstance: instance,
      },
      data: () => ({
        widgetParams,
      }),
    });

    expect(connector).toHaveBeenCalled();
    expect(factory).toHaveBeenCalledWith(widgetParams);
    expect(instance.addWidgets).toHaveBeenCalledWith([widget]);
  });

  it('removes a widget on destroy', () => {
    const localVue = createLocalVue();
    const instance = createFakeInstance();
    const Test = createFakeComponent(localVue);

    const widget = {
      render: () => {},
      dispose: () => {},
    };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };

    const wrapper = mount(Test, {
      mixins: [createWidgetMixin({ connector })],
      provide: {
        $_ais_instantSearchInstance: instance,
      },
      data: () => ({
        widgetParams,
      }),
    });

    expect(instance.addWidgets).toHaveBeenCalledWith([widget]);

    wrapper.destroy();

    expect(instance.removeWidgets).toHaveBeenCalledWith([widget]);
  });

  it('updates widget on widget params change', () => {
    const localVue = createLocalVue();
    const instance = createFakeInstance();
    const Test = createFakeComponent(localVue);

    const widget = {
      render: () => {},
      dispose: () => {},
    };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);

    const widgetParams = {
      attribute: 'brand',
    };

    const nextWidgetParams = {
      attribute: 'price',
    };

    const wrapper = mount(Test, {
      mixins: [createWidgetMixin({ connector })],
      provide: {
        $_ais_instantSearchInstance: instance,
      },
      data: () => ({
        widgetParams,
      }),
    });

    // Simulate render
    wrapper.vm.state = {
      items: [],
    };

    expect(instance.addWidgets).toHaveBeenCalledTimes(1);
    expect(instance.addWidgets).toHaveBeenCalledWith([widget]);

    // Simulate widget params update
    wrapper.vm.widgetParams = nextWidgetParams;

    expect(wrapper.vm.state).toBe(null);

    expect(instance.removeWidgets).toHaveBeenCalledTimes(1);
    expect(instance.removeWidgets).toHaveBeenCalledWith([widget]);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(factory).toHaveBeenCalledWith(nextWidgetParams);

    expect(instance.addWidgets).toHaveBeenCalledTimes(2);
    expect(instance.addWidgets).toHaveBeenCalledWith([widget]);
  });

  it('updates local state on connector render', () => {
    const localVue = createLocalVue();
    const instance = createFakeInstance();
    const Test = createFakeComponent(localVue);

    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };

    const state = {
      items: [],
    };

    const wrapper = mount(Test, {
      mixins: [createWidgetMixin({ connector })],
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

    expect(wrapper.vm.state).toBe(state);
  });
});

describe('on child index', () => {
  it('adds a widget on create', () => {
    const localVue = createLocalVue();
    const instance = createFakeInstance();
    const indexWidget = createFakeIndexWidget();
    const Test = createFakeComponent(localVue);

    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };

    mount(Test, {
      mixins: [createWidgetMixin({ connector })],
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => indexWidget,
      },
      data: () => ({
        widgetParams,
      }),
    });

    expect(connector).toHaveBeenCalled();
    expect(factory).toHaveBeenCalledWith(widgetParams);
    expect(indexWidget.addWidgets).toHaveBeenCalledWith([widget]);
  });

  it('removes a widget on destroy', () => {
    const localVue = createLocalVue();
    const instance = createFakeInstance();
    const indexWidget = createFakeIndexWidget();
    const Test = createFakeComponent(localVue);

    const widget = {
      render: () => {},
      dispose: () => {},
    };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };

    const wrapper = mount(Test, {
      mixins: [createWidgetMixin({ connector })],
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

  it('updates widget on widget params change', () => {
    const localVue = createLocalVue();
    const instance = createFakeInstance();
    const indexWidget = createFakeIndexWidget();
    const Test = createFakeComponent(localVue);

    const widget = {
      render: () => {},
      dispose: () => {},
    };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);

    const widgetParams = {
      attribute: 'brand',
    };

    const nextWidgetParams = {
      attribute: 'price',
    };

    const wrapper = mount(Test, {
      mixins: [createWidgetMixin({ connector })],
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => indexWidget,
      },
      data: () => ({
        widgetParams,
      }),
    });

    // Simulate render
    wrapper.vm.state = {
      items: [],
    };

    expect(indexWidget.addWidgets).toHaveBeenCalledTimes(1);
    expect(indexWidget.addWidgets).toHaveBeenCalledWith([widget]);

    // Simulate widget params update
    wrapper.vm.widgetParams = nextWidgetParams;

    expect(wrapper.vm.state).toBe(null);

    expect(indexWidget.removeWidgets).toHaveBeenCalledTimes(1);
    expect(indexWidget.removeWidgets).toHaveBeenCalledWith([widget]);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(factory).toHaveBeenCalledWith(nextWidgetParams);

    expect(indexWidget.addWidgets).toHaveBeenCalledTimes(2);
    expect(indexWidget.addWidgets).toHaveBeenCalledWith([widget]);
  });

  it('updates local state on connector render', () => {
    const localVue = createLocalVue();
    const instance = createFakeInstance();
    const indexWidget = createFakeIndexWidget();
    const Test = createFakeComponent(localVue);

    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = {
      attribute: 'brand',
    };

    const state = {
      items: [],
    };

    const wrapper = mount(Test, {
      mixins: [createWidgetMixin({ connector })],
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => indexWidget,
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

    expect(wrapper.vm.state).toBe(state);
  });
});
