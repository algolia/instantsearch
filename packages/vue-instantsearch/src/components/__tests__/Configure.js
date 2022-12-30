/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Configure from '../Configure';
import '../../../test/utils/sortedHtmlSerializer';

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

const defaultSlot = `
  <template v-slot="{ searchParameters }">
    <span>
      hitsPerPage: {{ searchParameters.hitsPerPage }}
    </span>
  </template>
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

it('renders null without default slot', () => {
  __setState(null);

  const wrapper = mount(Configure, {
    propsData: defaultProps,
  });

  expect(wrapper).vueToHaveEmptyHTML();
});

it('renders null without state', () => {
  __setState(null);

  const wrapper = mount({
    components: { Configure },
    data() {
      return { props: defaultProps };
    },
    template: `
      <Configure v-bind="props">
        ${defaultSlot}
      </Configure>
    `,
  });

  expect(wrapper).vueToHaveEmptyHTML();
});

it('renders with scoped slots', () => {
  __setState({ ...defaultState });

  const wrapper = mount({
    components: { Configure },
    data() {
      return { props: defaultProps };
    },
    template: `
      <Configure v-bind="props">
        ${defaultSlot}
      </Configure>
    `,
  });

  expect(wrapper.html()).toMatchSnapshot();
});
