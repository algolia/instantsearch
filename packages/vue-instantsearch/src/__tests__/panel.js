import { mount, createLocalVue } from '@vue/test-utils';
import {
  createPanelProviderMixin,
  createPanelConsumerMixin,
  PANEL_CHANGE_EVENT,
  PANEL_EMITTER_NAMESPACE,
} from '../panel';

const createFakeEmitter = () => ({
  $on: jest.fn(),
  $emit: jest.fn(),
  $destroy: jest.fn(),
});

const createFakeComponent = localVue =>
  localVue.component('Test', {
    render: () => null,
  });

describe('createPanelProviderMixin', () => {
  it('provides the emitter', () => {
    const emitter = createFakeEmitter();
    const mixin = createPanelProviderMixin();
    const provided = mixin.provide.call({ emitter });

    expect(provided).toMatchObject({
      [PANEL_EMITTER_NAMESPACE]: emitter,
    });
  });

  it('registers to PANEL_CHANGE_EVENT on created', () => {
    const localVue = createLocalVue();
    const emitter = createFakeEmitter();
    const Test = createFakeComponent(localVue);

    mount(Test, {
      mixins: [createPanelProviderMixin()],
      propsData: {
        emitter,
      },
    });

    expect(emitter.$on).toHaveBeenCalledTimes(1);
    expect(emitter.$on).toHaveBeenCalledWith(
      PANEL_CHANGE_EVENT,
      expect.any(Function)
    );
  });

  it('clears the Vue instance on beforeDestroy', () => {
    const LocalVue = createLocalVue();
    const emitter = createFakeEmitter();
    const Test = createFakeComponent(LocalVue);

    const wrapper = mount(Test, {
      mixins: [createPanelProviderMixin()],
      propsData: {
        emitter,
      },
    });

    wrapper.destroy();

    expect(emitter.$destroy).toHaveBeenCalledTimes(1);
  });

  it('updates canRefine on PANEL_CHANGE_EVENT', () => {
    const LocalVue = createLocalVue();
    const emitter = new LocalVue();
    const Test = createFakeComponent(LocalVue);
    const next = false;

    const wrapper = mount(Test, {
      mixins: [createPanelProviderMixin()],
      propsData: {
        emitter,
      },
    });

    expect(wrapper.vm.canRefine).toBe(true);

    emitter.$emit(PANEL_CHANGE_EVENT, next);

    expect(wrapper.vm.canRefine).toBe(false);
  });
});

describe('createPanelConsumerMixin', () => {
  const mapStateToCanRefine = state => state.attributeName;

  it('emits PANEL_CHANGE_EVENT on `state.attributeName` change', () => {
    const localVue = createLocalVue();
    const emitter = createFakeEmitter();
    const Test = createFakeComponent(localVue);

    const wrapper = mount(Test, {
      mixins: [
        createPanelConsumerMixin({
          mapStateToCanRefine,
        }),
      ],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    wrapper.vm.state = {
      attributeName: false,
    };

    expect(emitter.$emit).toHaveBeenCalledTimes(0);

    wrapper.vm.state = {
      attributeName: true,
    };

    expect(emitter.$emit).toHaveBeenCalledTimes(1);
  });

  it('emits at least once when both values are set', () => {
    const localVue = createLocalVue();
    const emitter = createFakeEmitter();
    const Test = createFakeComponent(localVue);

    const wrapper = mount(Test, {
      mixins: [
        createPanelConsumerMixin({
          mapStateToCanRefine,
        }),
      ],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    wrapper.vm.state = {
      attributeName: false,
    };

    expect(emitter.$emit).toHaveBeenCalledTimes(0);

    wrapper.vm.state = {
      attributeName: false,
    };

    expect(emitter.$emit).toHaveBeenCalledTimes(1);
  });

  it('do not emit when the previous value is not set', () => {
    const localVue = createLocalVue();
    const emitter = createFakeEmitter();
    const Test = createFakeComponent(localVue);

    const wrapper = mount(Test, {
      mixins: [
        createPanelConsumerMixin({
          mapStateToCanRefine,
        }),
      ],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    wrapper.vm.state = {
      attributeName: true,
    };

    expect(emitter.$emit).not.toHaveBeenCalled();
  });

  it('do not emit when the next value is not set', () => {
    const localVue = createLocalVue();
    const emitter = createFakeEmitter();
    const Test = createFakeComponent(localVue);

    const wrapper = mount(Test, {
      mixins: [
        createPanelConsumerMixin({
          mapStateToCanRefine,
        }),
      ],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    wrapper.vm.state = {
      attributeName: true,
    };

    expect(emitter.$emit).not.toHaveBeenCalled();

    wrapper.vm.state = null;

    expect(emitter.$emit).not.toHaveBeenCalled();
  });

  it('do not emit when the previous and next value are equal', () => {
    const localVue = createLocalVue();
    const emitter = createFakeEmitter();
    const Test = createFakeComponent(localVue);

    const wrapper = mount(Test, {
      mixins: [
        createPanelConsumerMixin({
          mapStateToCanRefine,
        }),
      ],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    wrapper.vm.state = {
      attributeName: true,
    };

    expect(emitter.$emit).not.toHaveBeenCalled();

    wrapper.vm.state = {
      attributeName: false,
    };

    expect(emitter.$emit).toHaveBeenCalledTimes(1);

    wrapper.vm.state = {
      attributeName: false,
    };

    expect(emitter.$emit).toHaveBeenCalledTimes(1);
  });
});
