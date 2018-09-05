import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/component';
import Hits from '../Hits.vue';

jest.mock('../../mixins/component');

const defaultState = {
  hits: [{ objectID: 'one' }, { objectID: 'two' }],
};

it('accepts an escapeHTML prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Hits, {
    propsData: {
      escapeHTML: true,
    },
  });

  expect(wrapper.vm.widgetParams.escapeHits).toBe(true);
});

it('accepts a transformItems prop', () => {
  __setState({
    ...defaultState,
  });

  const transformItems = () => {};

  const wrapper = mount(Hits, {
    propsData: {
      transformItems,
    },
  });

  expect(wrapper.vm.widgetParams.transformItems).toBe(transformItems);
});

it('renders correctly', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Hits);

  expect(wrapper.html()).toMatchSnapshot();
});
