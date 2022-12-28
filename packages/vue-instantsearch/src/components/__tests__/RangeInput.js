/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import RangeInput from '../RangeInput.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultRange = {
  min: 0,
  max: 1000,
};

const defaultState = {
  start: [0, 1000],
  range: defaultRange,
  canRefine: true,
  refine: () => {},
};

const defaultProps = {
  attribute: 'price',
};

it('accepts an attribute prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(RangeInput, {
    propsData: {
      ...defaultProps,
    },
  });

  expect(wrapper.vm.widgetParams.attribute).toBe('price');
});

it('accepts a min prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(RangeInput, {
    propsData: {
      ...defaultProps,
      min: 10,
    },
  });

  expect(wrapper.vm.widgetParams.min).toBe(10);
});

it('accepts a max prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(RangeInput, {
    propsData: {
      ...defaultProps,
      max: 500,
    },
  });

  expect(wrapper.vm.widgetParams.max).toBe(500);
});

it('accepts a precision prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(RangeInput, {
    propsData: {
      ...defaultProps,
      precision: 3,
    },
  });

  expect(wrapper.vm.widgetParams.precision).toBe(3);
});

describe('rendering', () => {
  it('displays correctly with default', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount(RangeInput, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('displays correctly with a min', () => {
    __setState({
      ...defaultState,
      range: {
        ...defaultRange,
        min: 100,
      },
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('displays correctly with a max', () => {
    __setState({
      ...defaultState,
      range: {
        ...defaultRange,
        max: 100,
      },
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('displays correctly with a min and a max', () => {
    __setState({
      ...defaultState,
      range: {
        min: 10,
        max: 37,
      },
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('displays correctly with a min refinement', () => {
    __setState({
      ...defaultState,
      start: [10, 500],
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.find('.ais-RangeInput-input--min').element.value).toBe('10');
  });

  it('displays correctly with a min refinement equal -Infinity', () => {
    __setState({
      ...defaultState,
      start: [-Infinity, 500],
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.find('.ais-RangeInput-input--min').element.value).toBe('');
  });

  it('displays correctly with a min refinement equal to min range', () => {
    __setState({
      ...defaultState,
      start: [10, 500],
      range: {
        ...defaultRange,
        min: 10,
      },
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.find('.ais-RangeInput-input--min').element.value).toBe('');
  });

  it('displays correctly with a max refinement', () => {
    __setState({
      ...defaultState,
      start: [10, 500],
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.find('.ais-RangeInput-input--max').element.value).toBe(
      '500'
    );
  });

  it('displays correctly with a max refinement equal Infinity', () => {
    __setState({
      ...defaultState,
      start: [10, Infinity],
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.find('.ais-RangeInput-input--max').element.value).toBe('');
  });

  it('displays correctly with a max refinement equal to max range', () => {
    __setState({
      ...defaultState,
      start: [10, 500],
      range: {
        ...defaultRange,
        max: 500,
      },
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.find('.ais-RangeInput-input--max').element.value).toBe('');
  });
});

it('exposes send-event method for insights middleware', async () => {
  const sendEvent = jest.fn();
  __setState({
    ...defaultState,
    sendEvent,
  });

  const wrapper = mount({
    components: { RangeInput },
    data() {
      return { props: defaultProps };
    },
    template: `
      <RangeInput v-bind="props">
        <template v-slot="{ sendEvent }">
          <div>
            <button @click="sendEvent()">Send Event</button>
          </div>
        </template>
      </RangeInput>
    `,
  });

  await wrapper.find('button').trigger('click');
  expect(sendEvent).toHaveBeenCalledTimes(1);
});

describe('refinement', () => {
  it('uses the value of the inputs when the form is submited', async () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        attribute: 'price',
      },
    });

    const minInput = wrapper.find('.ais-RangeInput-input--min');
    minInput.element.value = 100;
    await minInput.trigger('change');

    const maxInput = wrapper.find('.ais-RangeInput-input--max');
    maxInput.element.value = 106;
    await maxInput.trigger('change');

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(refine).toHaveBeenLastCalledWith(['100', '106']);
  });

  it('refines correctly when `start` given and user clicks submit without changing input field', async () => {
    const refine = jest.fn();
    __setState({
      refine,
      start: [50, 100],
      range: {
        min: 1,
        max: 5000,
      },
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith([50, 100]);
  });

  it('refines correctly even when state changes', async () => {
    const refine = jest.fn();
    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(RangeInput, {
      propsData: {
        ...defaultProps,
      },
    });

    // refine for the first time
    const minInput = wrapper.find('.ais-RangeInput-input--min');
    minInput.element.value = 10;
    await minInput.trigger('change');

    const maxInput = wrapper.find('.ais-RangeInput-input--max');
    maxInput.element.value = 100;
    await maxInput.trigger('change');

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(['10', '100']);

    // update the state
    await wrapper.setData({ state: { start: [50, 200] } }); // min: 10 -> 50, max: 100 -> 200

    await form.trigger('submit');
    expect(refine).toHaveBeenCalledTimes(2);
    expect(refine).toHaveBeenCalledWith([50, 200]);
  });
});
