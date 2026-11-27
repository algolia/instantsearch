/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
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
  currentRefinement: { min: undefined, max: undefined },
  range: defaultRange,
  canRefine: true,
  refine: () => {},
};

const defaultProps = {
  attribute: 'price',
};

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

it('renders the slots in place of the default content', () => {
  __setState({ ...defaultState });

  const wrapper = mount({
    components: { RangeInput },
    data() {
      return { props: defaultProps };
    },
    template: `
      <RangeInput v-bind="props">
        <template v-slot:minLabel><span>Min</span></template>
        <template v-slot:maxLabel><span>Max</span></template>
        <template v-slot:separator><em>SEPARATOR</em></template>
        <template v-slot:submitLabel><em>SUBMIT</em></template>
      </RangeInput>
    `,
  });

  expect(
    Array.from(
      wrapper.element.querySelectorAll('.ais-RangeInput-label span')
    ).map((element) => element.textContent)
  ).toEqual(['Min', 'Max']);
  expect(wrapper.find('.ais-RangeInput-separator').html()).toContain(
    '<em>SEPARATOR</em>'
  );
  expect(wrapper.find('.ais-RangeInput-submit').html()).toContain(
    '<em>SUBMIT</em>'
  );
});

it('maps the class names onto the shared component', () => {
  __setState({ ...defaultState, canRefine: false });

  const wrapper = mount(RangeInput, {
    propsData: {
      ...defaultProps,
      classNames: {
        'ais-RangeInput': 'ROOT',
        'ais-RangeInput--noRefinement': 'NOREFINEMENT',
        'ais-RangeInput-form': 'FORM',
        'ais-RangeInput-label': 'LABEL',
        'ais-RangeInput-input': 'INPUT',
        'ais-RangeInput-input--min': 'INPUTMIN',
        'ais-RangeInput-input--max': 'INPUTMAX',
        'ais-RangeInput-separator': 'SEPARATOR',
        'ais-RangeInput-submit': 'SUBMIT',
      },
    },
  });

  expect(wrapper.classes()).toEqual(
    expect.arrayContaining([
      'ais-RangeInput',
      'ROOT',
      'ais-RangeInput--noRefinement',
      'NOREFINEMENT',
    ])
  );
  expect(wrapper.find('.ais-RangeInput-form').classes()).toContain('FORM');
  expect(wrapper.find('.ais-RangeInput-label').classes()).toContain('LABEL');
  expect(wrapper.find('.ais-RangeInput-input--min').classes()).toEqual(
    expect.arrayContaining(['INPUT', 'INPUTMIN'])
  );
  expect(wrapper.find('.ais-RangeInput-input--max').classes()).toEqual(
    expect.arrayContaining(['INPUT', 'INPUTMAX'])
  );
  expect(wrapper.find('.ais-RangeInput-separator').classes()).toContain(
    'SEPARATOR'
  );
  expect(wrapper.find('.ais-RangeInput-submit').classes()).toContain('SUBMIT');
  expect(wrapper.find('.ais-RangeInput-submit').element.disabled).toBe(true);
});

it('refines with the typed values on submit', async () => {
  const refine = jest.fn();
  __setState({ ...defaultState, refine });

  const wrapper = mount(RangeInput, { propsData: defaultProps });

  const min = wrapper.find('.ais-RangeInput-input--min');
  min.element.value = '10';
  await min.trigger('input');
  const max = wrapper.find('.ais-RangeInput-input--max');
  max.element.value = '20';
  await max.trigger('input');

  await wrapper.find('form').trigger('submit');

  expect(refine).toHaveBeenCalledTimes(1);
  expect(refine).toHaveBeenLastCalledWith({ min: '10', max: '20' });
});
