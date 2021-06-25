import { mount } from '../../../test/utils';
import mitt from 'mitt';
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
  const mapStateToCanRefine = state => state.attributeName;

  it('emits PANEL_CHANGE_EVENT on `state.attributeName` change', () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

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

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, false);

    wrapper.vm.state = {
      attributeName: true,
    };

    expect(emitter.emit).toHaveBeenCalledTimes(2);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, true);
  });

  it('emits once when both values are set', () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

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

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, false);

    wrapper.vm.state = {
      attributeName: false,
    };

    expect(emitter.emit).toHaveBeenCalledTimes(1);
  });

  it('emits once on init of the component', () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

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

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, true);
  });

  it('do not emit when the next value is not set', () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

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

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, true);

    wrapper.vm.state = null;

    expect(emitter.emit).toHaveBeenCalledTimes(1);
  });

  it('do not emit when the previous and next value are equal', () => {
    const emitter = createFakeEmitter();
    const Test = createFakeComponent();

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

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, true);

    wrapper.vm.state = {
      attributeName: false,
    };

    expect(emitter.emit).toHaveBeenCalledTimes(2);
    expect(emitter.emit).toHaveBeenLastCalledWith(PANEL_CHANGE_EVENT, false);

    wrapper.vm.state = {
      attributeName: false,
    };

    expect(emitter.emit).toHaveBeenCalledTimes(2);
  });
});
