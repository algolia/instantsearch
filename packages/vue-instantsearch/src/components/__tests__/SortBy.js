/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { mount } from '../../../test/utils';
import '../../../test/utils/sortedHtmlSerializer';
import { __setState } from '../../mixins/widget';
import SortBy from '../SortBy.vue';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultState = {
  options: [
    { value: 'some_index', label: 'Relevance' },
    { value: 'some_index_cool', label: 'Coolness ascending' },
    { value: 'some_index_quality', label: 'Quality ascending' },
  ],
  hasNoResults: false,
  canRefine: true,
  currentRefinement: 'some_index',
};

const defaultProps = {
  items: [
    { value: 'some_index', label: 'Relevance' },
    { value: 'some_index_cool', label: 'Coolness ascending' },
    { value: 'some_index_quality', label: 'Quality ascending' },
  ],
};

it('renders with scoped slots', () => {
  const defaultSlot = `
  <template v-slot="{ items, refine, currentRefinement }">
    <select @change="refine($event.currentTarget.value)">
      <option
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :selected="item.value === currentRefinement"
      >
        {{item.label}}
      </option>
    </select>
  </template>
`;

  __setState({
    ...defaultState,
  });

  const wrapper = mount({
    components: { SortBy },
    data() {
      return { props: defaultProps };
    },
    template: `
      <SortBy v-bind="props">
        ${defaultSlot}
      </SortBy>
    `,
  });

  expect(wrapper.html()).toMatchSnapshot();
});
