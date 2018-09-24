import { mount, createLocalVue } from '@vue/test-utils';
import { createWidgetMixin } from '../widget';

const createFakeComponent = localVue =>
  localVue.component('Test', {
    render: () => null,
  });

const createFakeInstance = () => ({
  addWidget: jest.fn(),
  removeWidget: jest.fn(),
  started: true,
});

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
      instantSearchInstance: instance,
    },
    data: () => ({
      widgetParams,
    }),
  });

  expect(connector).toHaveBeenCalled();
  expect(factory).toHaveBeenCalledWith(widgetParams);
  expect(instance.addWidget).toHaveBeenCalledWith(widget);
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
      instantSearchInstance: instance,
    },
    data: () => ({
      widgetParams,
    }),
  });

  expect(instance.addWidget).toHaveBeenCalledWith(widget);

  wrapper.destroy();

  expect(instance.removeWidget).toHaveBeenCalledWith(widget);
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
      instantSearchInstance: instance,
    },
    data: () => ({
      widgetParams,
    }),
  });

  // Simulate render
  wrapper.vm.state = {
    items: [],
  };

  expect(instance.addWidget).toHaveBeenCalledTimes(1);
  expect(instance.addWidget).toHaveBeenCalledWith(widget);

  // Simulate widget params update
  wrapper.vm.widgetParams = nextWidgetParams;

  expect(wrapper.vm.state).toBe(null);

  expect(instance.removeWidget).toHaveBeenCalledTimes(1);
  expect(instance.removeWidget).toHaveBeenCalledWith(widget);

  expect(factory).toHaveBeenCalledTimes(2);
  expect(factory).toHaveBeenCalledWith(nextWidgetParams);

  expect(instance.addWidget).toHaveBeenCalledTimes(2);
  expect(instance.addWidget).toHaveBeenCalledWith(widget);
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
      instantSearchInstance: instance,
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
