/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Pagination from '../Pagination.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultState = {
  createURL: () => '#',
  refine: jest.fn(),
  pages: [0, 1, 2, 3, 4, 5, 6],
  nbPages: 20,
  currentRefinement: 0,
  isFirstPage: true,
  isLastPage: false,
};

it('accepts a padding prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Pagination, {
    propsData: {
      padding: 5,
    },
  });

  expect(wrapper.vm.widgetParams.padding).toBe(5);
});

it('accepts a totalPages prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Pagination, {
    propsData: {
      totalPages: 10,
    },
  });

  expect(wrapper.vm.widgetParams.totalPages).toBe(10);
});

it('renders correctly first page', () => {
  __setState(defaultState);
  const wrapper = mount(Pagination);

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly another page', () => {
  __setState({
    ...defaultState,
    pages: [3, 4, 5, 6, 7, 8, 9],
    nbPages: 20,
    currentRefinement: 6,
    isFirstPage: false,
    isLastPage: false,
  });
  const wrapper = mount(Pagination);

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly last page', () => {
  __setState({
    ...defaultState,
    pages: [3, 4, 5, 6, 7, 8, 9],
    nbPages: 9,
    currentRefinement: 9,
    isFirstPage: false,
    isLastPage: true,
  });
  const wrapper = mount(Pagination);

  expect(wrapper.html()).toMatchSnapshot();
});

it('Moves to the first page on that button', async () => {
  __setState({
    ...defaultState,
    isFirstPage: false,
  });
  const wrapper = mount(Pagination);

  const firstPage = wrapper.find(
    '.ais-Pagination-item--firstPage .ais-Pagination-link'
  );
  await firstPage.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(0);
});

it('Moves to the next page on that button', async () => {
  const currentRefinement = 5;
  __setState({
    ...defaultState,
    currentRefinement,
  });
  const wrapper = mount(Pagination);

  const nextPage = wrapper.find(
    '.ais-Pagination-item--nextPage .ais-Pagination-link'
  );
  await nextPage.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(
    currentRefinement + 1
  );
});

it('Moves to the last page on that button', async () => {
  const nbPages = 1000;
  __setState({
    ...defaultState,
    isLastPage: false,
    nbPages,
  });
  const wrapper = mount(Pagination);

  const lastPage = wrapper.find(
    '.ais-Pagination-item--lastPage .ais-Pagination-link'
  );
  await lastPage.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(nbPages - 1);
});

it('Moves to the previous page on that button', async () => {
  const currentRefinement = 5;
  __setState({
    ...defaultState,
    isFirstPage: false,
    currentRefinement,
  });
  const wrapper = mount(Pagination);

  const previousPage = wrapper.find(
    '.ais-Pagination-item--previousPage .ais-Pagination-link'
  );
  await previousPage.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(
    currentRefinement - 1
  );
});

it('implements showFirst', async () => {
  __setState({ ...defaultState });

  const wrapper = mount(Pagination, {
    propsData: {
      showFirst: false,
    },
  });

  expect(wrapper.find('.ais-Pagination-item--firstPage').exists()).toBe(false);

  await wrapper.setProps({
    showFirst: true,
  });

  expect(wrapper.find('.ais-Pagination-item--firstPage').exists()).toBe(true);
});

it('implements showPrevious', async () => {
  __setState({ ...defaultState });

  const wrapper = mount(Pagination, {
    propsData: {
      showPrevious: false,
    },
  });

  expect(wrapper.find('.ais-Pagination-item--previousPage').exists()).toBe(
    false
  );

  await wrapper.setProps({
    showPrevious: true,
  });

  expect(wrapper.find('.ais-Pagination-item--previousPage').exists()).toBe(
    true
  );
});

it('implements showLast', async () => {
  __setState({ ...defaultState });

  const wrapper = mount(Pagination, {
    propsData: {
      showLast: false,
    },
  });

  expect(wrapper.find('.ais-Pagination-item--lastPage').exists()).toBe(false);

  await wrapper.setProps({
    showLast: true,
  });

  expect(wrapper.find('.ais-Pagination-item--lastPage').exists()).toBe(true);
});

it('implements showNext', async () => {
  __setState({ ...defaultState });

  const wrapper = mount(Pagination, {
    propsData: {
      showNext: false,
    },
  });

  expect(wrapper.find('.ais-Pagination-item--nextPage').exists()).toBe(false);

  await wrapper.setProps({
    showNext: true,
  });

  expect(wrapper.find('.ais-Pagination-item--nextPage').exists()).toBe(true);
});
