/**
 * @jest-environment jsdom
 */

import { getByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import '../../../test/utils/sortedHtmlSerializer';
import HitsPerPage from '../HitsPerPage.vue';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultState = {
  items: [
    {
      label: '10 results',
      value: 10,
      default: true,
    },
    {
      label: '20 results',
      value: 20,
    },
  ],
};

const defaultProps = {
  items: [
    {
      label: '10 results',
      value: 10,
      default: true,
    },
    {
      label: '20 results',
      value: 20,
    },
  ],
};

it('accepts a transformItems prop', () => {
  __setState({ ...defaultState });

  const transformItems = () => {};

  const wrapper = mount(HitsPerPage, {
    propsData: {
      ...defaultProps,
      transformItems,
    },
  });

  expect(wrapper.vm.widgetParams.transformItems).toBe(transformItems);
});

it('renders correctly', () => {
  __setState({ ...defaultState });

  const wrapper = mount(HitsPerPage, {
    propsData: defaultProps,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('calls `refine` with the `value` on `change`', () => {
  __setState({
    ...defaultState,
    refine: jest.fn(),
  });

  const wrapper = mount(HitsPerPage, {
    propsData: defaultProps,
  });

  userEvent.selectOptions(
    getByRole(wrapper.element, 'combobox'),
    getByRole(wrapper.element, 'option', { name: '20 results' })
  );

  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(20);
});
