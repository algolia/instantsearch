import { mount } from '@vue/test-utils';

import Menu from '../Menu.vue';
import { __setState } from '../../component';

jest.mock('../../component');

const defaultState = {
  canRefine: true,
  canToggleShowMore: false,
  createURL: jest.fn(),
  isShowingMore: false,
  items: [
    { value: 'foo', label: 'foo', count: 2, isRefined: true },
    { value: 'bar', label: 'bar', count: 3 },
    { value: 'foobar', label: 'foobar', count: 4 },
  ],
  refine: jest.fn(),
  toggleShowMore: jest.fn(),
};
//
it('renders correctly', () => {
  __setState(defaultState);

  const wrapper = mount(Menu, { propsData: { attribute: 'foo' } });
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly with showMore', () => {
  __setState({ ...defaultState, canToggleShowMore: true });

  const wrapper = mount(Menu, {
    propsData: { attribute: 'foo', showMore: true },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

it('calls `refine()` when click on an element', () => {
  __setState(defaultState);

  const wrapper = mount(Menu, { propsData: { attribute: 'foo' } });
  wrapper.find('.ais-Menu-link').trigger('click');

  expect(defaultState.refine).toHaveBeenCalled();
  expect(defaultState.refine).toHaveBeenCalledWith(defaultState.items[0].value);
});

it('calls `toggleShowMore()` when possible', () => {
  __setState({ ...defaultState, canToggleShowMore: true });

  const wrapper = mount(Menu, {
    propsData: { attribute: 'foo', showMore: true },
  });
  wrapper.find('button').trigger('click');

  expect(defaultState.toggleShowMore).toHaveBeenCalled();
});
