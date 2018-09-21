import { mount } from '@vue/test-utils';
import CurrentRefinements from '../CurrentRefinements.vue';
import { __setState } from '../../mixins/widget';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

it('accepts a transformItems prop', () => {
  __setState({
    refinements: [],
  });

  const transformItems = () => {};

  const wrapper = mount(CurrentRefinements, {
    propsData: {
      transformItems,
    },
  });

  expect(wrapper.vm.widgetParams.transformItems).toBe(transformItems);
});

it('renders correctly (empty)', () => {
  __setState({
    refinements: [],
  });
  const wrapper = mount(CurrentRefinements);
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly (with refinements)', () => {
  __setState({
    refinements: [
      {
        attributeName: 'brands',
        computedLabel: 'apple',
      },
      {
        attributeName: 'colors',
        computedLabel: 'red',
      },
      {
        attributeName: 'requirements',
        computedLabel: 'free',
      },
    ],
  });
  const wrapper = mount(CurrentRefinements);
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly (with query)', () => {
  __setState({
    refinements: [
      {
        computedLabel: 'some query',
        name: 'some query',
        query: 'some query',
        type: 'query',
      },
    ],
  });
  const wrapper = mount(CurrentRefinements, {
    propsData: { clearsQuery: true },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

it('calls `refine` with an item', () => {
  __setState({
    refinements: [
      {
        attributeName: 'brands',
        computedLabel: 'apple',
      },
      {
        attributeName: 'colors',
        computedLabel: 'red',
      },
      {
        attributeName: 'requirements',
        computedLabel: 'free',
      },
    ],
    refine: jest.fn(),
  });
  const wrapper = mount(CurrentRefinements);
  wrapper.find('.ais-CurrentRefinements-delete').trigger('click');

  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith({
    attributeName: 'brands',
    computedLabel: 'apple',
  });
});

it('calls `refine` with clear all', () => {
  __setState({
    refinements: [
      {
        attributeName: 'brands',
        computedLabel: 'apple',
      },
      {
        attributeName: 'colors',
        computedLabel: 'red',
      },
      {
        attributeName: 'requirements',
        computedLabel: 'free',
      },
    ],
    clearAllClick: jest.fn(),
  });
  const wrapper = mount(CurrentRefinements);
  wrapper.find('.ais-CurrentRefinements-reset').trigger('click');

  expect(wrapper.vm.state.clearAllClick).toHaveBeenCalled();
});
