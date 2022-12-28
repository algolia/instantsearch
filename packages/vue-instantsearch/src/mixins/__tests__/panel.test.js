/**
 * @jest-environment jsdom
 */

import { mount, nextTick } from '../../../test/utils';
import mitt from 'mitt';
import { isVue3 } from '../../util/vue-compat';
import {
  createPanelProviderMixin,
  createPanelConsumerMixin,
  PANEL_CHANGE_EVENT,
  PANEL_EMITTER_NAMESPACE,
} from '../panel';

const createFakeEmitter = () => ({
  on: jest.fn(),
  emit: jest.fn(),
  all: {
    clear: jest.fn(),
  },
});

const createFakeComponent = () => ({
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
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

    mount(Test, {
      mixins: [createPanelProviderMixin()],
      propsData: {
        emitter,
      },
    });

    expect(emitter.on).toHaveBeenCalledTimes(1);
    expect(emitter.on).toHaveBeenCalledWith(
      PANEL_CHANGE_EVENT,
      expect.any(Function)
    );
  });

  it('clears the Vue instance on beforeDestroy', () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

    const wrapper = mount(Test, {
      mixins: [createPanelProviderMixin()],
      propsData: {
        emitter,
      },
    });

    wrapper.destroy();

    expect(emitter.all.clear).toHaveBeenCalledTimes(1);
  });

  it('updates canRefine on PANEL_CHANGE_EVENT', () => {
    const emitter = mitt();
    const Test = createFakeComponent();
    const next = false;

    const wrapper = mount(Test, {
      mixins: [createPanelProviderMixin()],
      propsData: {
        emitter,
      },
    });

    expect(wrapper.vm.canRefine).toBe(true);

    emitter.emit(PANEL_CHANGE_EVENT, next);

    expect(wrapper.vm.canRefine).toBe(false);
  });
});

describe('createPanelConsumerMixin', () => {
  it('emits PANEL_CHANGE_EVENT on `state.canRefine` change', async () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

    const wrapper = mount(Test, {
      mixins: [createPanelConsumerMixin()],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    await wrapper.setData({
      state: {
        canRefine: false,
      },
    });

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, false);

    if (isVue3) {
      await wrapper.setData({ state: { canRefine: true } });
    } else {
      // ↓ this should be replaceable with `wrapper.setData()` but it didn't
      // trigger the watcher in `createPanelConsumerMixin`.
      // It's probably a bug from vue-test-utils.
      // https://github.com/vuejs/vue-test-utils/issues/1756
      // https://github.com/vuejs/vue-test-utils/issues/149
      wrapper.vm.$set(wrapper.vm, 'state', {
        canRefine: true,
      });
      await nextTick();
    }

    expect(emitter.emit).toHaveBeenCalledTimes(2);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, true);
  });

  it('emits once when both values are set', async () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

    const wrapper = mount(Test, {
      mixins: [createPanelConsumerMixin()],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    await wrapper.setData({
      state: {
        canRefine: false,
      },
    });

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, false);

    await wrapper.setData({
      state: {
        canRefine: false,
      },
    });

    expect(emitter.emit).toHaveBeenCalledTimes(1);
  });

  it('emits once on init of the component', async () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

    const wrapper = mount(Test, {
      mixins: [createPanelConsumerMixin()],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    await wrapper.setData({
      state: {
        canRefine: true,
      },
    });

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, true);
  });

  it('do not emit when the next value is not set', async () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

    const wrapper = mount(Test, {
      mixins: [createPanelConsumerMixin()],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    await wrapper.setData({
      state: {
        canRefine: true,
      },
    });

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, true);

    if (isVue3) {
      await wrapper.setData({ state: null });
    } else {
      wrapper.vm.$set(wrapper.vm, 'state', null);
      await nextTick();
    }

    expect(emitter.emit).toHaveBeenCalledTimes(1);
  });

  it('do not emit when the previous and next value are equal', async () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

    const wrapper = mount(Test, {
      mixins: [createPanelConsumerMixin()],
      provide: {
        [PANEL_EMITTER_NAMESPACE]: emitter,
      },
    });

    await wrapper.setData({
      state: {
        canRefine: true,
      },
    });

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, true);

    if (isVue3) {
      await wrapper.setData({ state: { canRefine: false } });
    } else {
      wrapper.vm.$set(wrapper.vm, 'state', { canRefine: false });
      await nextTick();
    }

    expect(emitter.emit).toHaveBeenCalledTimes(2);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, false);

    if (isVue3) {
      await wrapper.setData({ state: { canRefine: false } });
    } else {
      wrapper.vm.$set(wrapper.vm, 'state', { canRefine: false });
      await nextTick();
    }

    expect(emitter.emit).toHaveBeenCalledTimes(2);
  });
});
