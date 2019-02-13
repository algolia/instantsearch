import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
import Pagination from '../Pagination.vue';

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

it('Moves to the first page on that button', () => {
  __setState({
    ...defaultState,
    isFirstPage: false,
  });
  const wrapper = mount(Pagination);

  const firstPage = wrapper.find(
    '.ais-Pagination-item--firstPage .ais-Pagination-link'
  );
  firstPage.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(0);
});

it('Moves to the next page on that button', () => {
  const currentRefinement = 5;
  __setState({
    ...defaultState,
    currentRefinement,
  });
  const wrapper = mount(Pagination);

  const nextPage = wrapper.find(
    '.ais-Pagination-item--nextPage .ais-Pagination-link'
  );
  nextPage.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(
    currentRefinement + 1
  );
});

it('Moves to the last page on that button', () => {
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
  lastPage.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(nbPages - 1);
});

it('Moves to the previous page on that button', () => {
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
  previousPage.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(
    currentRefinement - 1
  );
});

it('calls the Panel mixin with `nbPages`', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Pagination);

  const mapStateToCanRefine = () =>
    wrapper.vm.mapStateToCanRefine(wrapper.vm.state);

  expect(mapStateToCanRefine()).toBe(true);

  wrapper.setData({
    state: {
      nbPages: 1,
    },
  });

  expect(mapStateToCanRefine()).toBe(false);
});

it('implements showFirst', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Pagination, {
    propsData: {
      showFirst: false,
    },
  });

  expect(wrapper.find('.ais-Pagination-item--firstPage').exists()).toBe(false);

  wrapper.setProps({
    showFirst: true,
  });

  expect(wrapper.find('.ais-Pagination-item--firstPage').exists()).toBe(true);
});

it('implements showPrevious', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Pagination, {
    propsData: {
      showPrevious: false,
    },
  });

  expect(wrapper.find('.ais-Pagination-item--previousPage').exists()).toBe(
    false
  );

  wrapper.setProps({
    showPrevious: true,
  });

  expect(wrapper.find('.ais-Pagination-item--previousPage').exists()).toBe(
    true
  );
});

it('implements showLast', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Pagination, {
    propsData: {
      showLast: false,
    },
  });

  expect(wrapper.find('.ais-Pagination-item--lastPage').exists()).toBe(false);

  wrapper.setProps({
    showLast: true,
  });

  expect(wrapper.find('.ais-Pagination-item--lastPage').exists()).toBe(true);
});

it('implements showNext', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Pagination, {
    propsData: {
      showNext: false,
    },
  });

  expect(wrapper.find('.ais-Pagination-item--nextPage').exists()).toBe(false);

  wrapper.setProps({
    showNext: true,
  });

  expect(wrapper.find('.ais-Pagination-item--nextPage').exists()).toBe(true);
});
