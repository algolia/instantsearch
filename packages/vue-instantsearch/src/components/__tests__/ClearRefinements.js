/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import ClearRefinements from '../ClearRefinements.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultState = {
  hasRefinements: true,
  refine: () => {},
  createURL: () => {},
};

it('accepts an excludedAttributes prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(ClearRefinements, {
    propsData: {
      excludedAttributes: ['brand'],
    },
  });

  expect(wrapper.vm.widgetParams.excludedAttributes).toEqual(['brand']);
});

it('accepts an includedAttributes prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(ClearRefinements, {
    propsData: {
      includedAttributes: ['brand'],
    },
  });

  expect(wrapper.vm.widgetParams.includedAttributes).toEqual(['brand']);
  expect(wrapper.vm.widgetParams.excludedAttributes).toBeUndefined();
});

describe('default render', () => {
  it('renders correctly', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount(ClearRefinements);

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinements', () => {
    __setState({
      ...defaultState,
      hasRefinements: false,
    });

    const wrapper = mount(ClearRefinements);

    const button = wrapper.find('button');

    expect(button).vueToBeDisabled();
    expect(button.classes()).toContain('ais-ClearRefinements-button--disabled');
    expect(wrapper.htmlCompat()).toMatchSnapshot();
  });

  it('calls refine on button click', async () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(ClearRefinements);

    await wrapper.find('button').trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
  });
});

describe('custom default render', () => {
  const defaultSlot = `
    <template v-slot="{ canRefine, refine, createURL }">
      <div :class="[!canRefine && 'no-refinement']">
        <a :href="createURL()" @click.prevent="refine">
          Clear refinements
        </a>
      </div>
    </template>
  `;

  it('renders correctly', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount({
      components: { ClearRefinements },
      template: `
        <ClearRefinements>
          ${defaultSlot}
        </ClearRefinements>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      hasRefinements: false,
    });

    const wrapper = mount({
      components: { ClearRefinements },
      template: `
        <ClearRefinements>
          ${defaultSlot}
        </ClearRefinements>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with an URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: () => `/clear/refinements`,
    });

    const wrapper = mount({
      components: { ClearRefinements },
      template: `
        <ClearRefinements>
          ${defaultSlot}
        </ClearRefinements>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on link click', async () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount({
      components: { ClearRefinements },
      template: `
        <ClearRefinements>
          ${defaultSlot}
        </ClearRefinements>
      `,
    });

    await wrapper.find('a').trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
  });
});

describe('custom resetLabel render', () => {
  const resetLabelSlot = `
    <span>Remove the refinements</span>
  `;

  it('renders correctly with a custom reset label', () => {
    __setState({ ...defaultState });

    const wrapper = mount(ClearRefinements, {
      slots: {
        resetLabel: resetLabelSlot,
      },
    });

    expect(wrapper.find('button').text()).toBe('Remove the refinements');
    expect(wrapper.html()).toMatchSnapshot();
  });
});
