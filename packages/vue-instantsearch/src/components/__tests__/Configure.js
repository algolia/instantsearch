import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
import Configure from '../Configure';

jest.mock('../../mixins/widget');

const defaultState = {
  widgetParams: {
    searchParameters: {
      hitsPerPage: 5,
    },
  },
};

const defaultProps = {
  hitsPerPage: 5,
};

const defaultScopedSlots = `
  <span slot-scope="{ searchParameters }">
    hitsPerPage: {{ searchParameters.hitsPerPage }}
  </span>
`;

it('accepts SearchParameters from attributes', () => {
  const wrapper = mount(Configure, {
    propsData: {
      ...defaultProps,
      distinct: true,
    },
  });

  expect(wrapper.vm.widgetParams.searchParameters).toEqual({
    hitsPerPage: 5,
    distinct: true,
  });
});

it('renders null without scoped slots', () => {
  __setState(null);

  const wrapper = mount(Configure, {
    propsData: defaultProps,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders null without state', () => {
  __setState(null);

  const wrapper = mount(Configure, {
    propsData: defaultProps,
    scopedSlots: {
      default: defaultScopedSlots,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders with scoped slots', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Configure, {
    propsData: defaultProps,
    scopedSlots: {
      default: defaultScopedSlots,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});
