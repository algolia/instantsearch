/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import RefinementList from '../RefinementList.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultState = {
  items: [
    {
      value: 'Apple',
      label: 'Apple',
      highlighted: 'Apple',
      count: 746,
      isRefined: false,
    },
    {
      value: 'Samsung',
      label: 'Samsung',
      highlighted: 'Samsung',
      count: 633,
      isRefined: false,
    },
  ],
  canRefine: true,
  canToggleShowMore: true,
  isShowingMore: false,
  refine: () => {},
  createURL: () => {},
  toggleShowMore: () => {},
  searchForItems: () => {},
  isFromSearch: false,
  sendEvent: () => {},
};

const defaultProps = {
  attribute: 'brand',
};

it('sets the aria-label on the show more button', () => {
  __setState({ ...defaultState });

  const wrapper = mount(RefinementList, {
    propsData: {
      ...defaultProps,
      showMore: true,
      showMoreButtonLabel: 'Show more brands',
    },
  });

  expect(
    wrapper.find('.ais-RefinementList-showMore').attributes('aria-label')
  ).toBe('Show more brands');
});

it('renders the shared markup with formatted counts', () => {
  __setState({
    ...defaultState,
    items: [
      { ...defaultState.items[0], count: 12345, isRefined: true },
      defaultState.items[1],
    ],
  });

  const wrapper = mount(RefinementList, { propsData: defaultProps });

  const items = wrapper.findAll('.ais-RefinementList-item');
  expect(items).toHaveLength(2);
  expect(items.at(0).classes()).toContain('ais-RefinementList-item--selected');
  expect(items.at(0).find('input').element.checked).toBe(true);
  expect(items.at(1).find('input').element.checked).toBe(false);
  expect(items.at(0).find('.ais-RefinementList-count').text()).toBe(
    (12345).toLocaleString()
  );
  expect(items.at(0).find('.ais-RefinementList-labelText').text()).toBe(
    'Apple'
  );
});

it('refines when a checkbox changes', async () => {
  const refine = jest.fn();
  __setState({ ...defaultState, refine });

  const wrapper = mount(RefinementList, { propsData: defaultProps });

  await wrapper.findAll('input').at(1).trigger('change');

  expect(refine).toHaveBeenCalledTimes(1);
  expect(refine).toHaveBeenCalledWith('Samsung');
});

it('applies the classNames prop', () => {
  __setState({ ...defaultState });

  const wrapper = mount(RefinementList, {
    propsData: {
      ...defaultProps,
      showMore: true,
      classNames: {
        'ais-RefinementList': 'ROOT',
        'ais-RefinementList-list': 'LIST',
        'ais-RefinementList-item': 'ITEM',
        'ais-RefinementList-label': 'LABEL',
        'ais-RefinementList-checkbox': 'CHECKBOX',
        'ais-RefinementList-labelText': 'LABELTEXT',
        'ais-RefinementList-count': 'COUNT',
        'ais-RefinementList-showMore': 'SHOWMORE',
      },
    },
  });

  expect(wrapper.find('.ais-RefinementList').classes()).toContain('ROOT');
  expect(wrapper.find('.ais-RefinementList-list').classes()).toContain('LIST');
  expect(wrapper.find('.ais-RefinementList-item').classes()).toContain('ITEM');
  expect(wrapper.find('.ais-RefinementList-label').classes()).toContain(
    'LABEL'
  );
  expect(wrapper.find('.ais-RefinementList-checkbox').classes()).toContain(
    'CHECKBOX'
  );
  expect(wrapper.find('.ais-RefinementList-labelText').classes()).toContain(
    'LABELTEXT'
  );
  expect(wrapper.find('.ais-RefinementList-count').classes()).toContain(
    'COUNT'
  );
  expect(wrapper.find('.ais-RefinementList-showMore').classes()).toContain(
    'SHOWMORE'
  );
});

it('renders the item slot inside each item', () => {
  __setState({ ...defaultState });

  const wrapper = mount({
    components: { RefinementList },
    data() {
      return { props: defaultProps };
    },
    template: `
      <RefinementList v-bind="props">
        <template v-slot:item="{ item, refine }">
          <button class="custom" @click="refine(item.value)">{{ item.label }}</button>
        </template>
      </RefinementList>
    `,
  });

  const items = wrapper.findAll('.ais-RefinementList-item');
  expect(items).toHaveLength(2);
  expect(items.at(1).find('button.custom').text()).toBe('Samsung');
  expect(wrapper.find('.ais-RefinementList-label').exists()).toBe(false);
});

it('renders the showMoreLabel slot inside the button', () => {
  __setState({ ...defaultState, isShowingMore: true });

  const wrapper = mount({
    components: { RefinementList },
    data() {
      return { props: { ...defaultProps, showMore: true } };
    },
    template: `
      <RefinementList v-bind="props">
        <template v-slot:showMoreLabel="{ isShowingMore }">
          {{ isShowingMore ? 'Fewer' : 'More' }}
        </template>
      </RefinementList>
    `,
  });

  const button = wrapper.find('.ais-RefinementList-showMore');
  expect(button.text()).toBe('Fewer');
  expect(button.attributes('aria-expanded')).toBe('true');
});

it('renders the noResults slot inside the no results element', () => {
  __setState({ ...defaultState, items: [], isFromSearch: true });

  const wrapper = mount({
    components: { RefinementList },
    data() {
      return { props: { ...defaultProps, searchable: true } };
    },
    template: `
      <RefinementList v-bind="props">
        <template v-slot:noResults="{ query }">
          <p class="custom">Nothing for "{{ query }}"</p>
        </template>
      </RefinementList>
    `,
  });

  expect(wrapper.find('.ais-RefinementList-noResults .custom').text()).toBe(
    'Nothing for ""'
  );
  expect(wrapper.find('.ais-RefinementList-list').exists()).toBe(false);
  expect(
    wrapper.find('.ais-RefinementList-searchBox .ais-SearchBox form').exists()
  ).toBe(true);
});

it('renders the default slot instead of the markup', () => {
  __setState({ ...defaultState });

  const wrapper = mount({
    components: { RefinementList },
    data() {
      return { props: defaultProps };
    },
    template: `
      <RefinementList v-bind="props">
        <template v-slot="{ items }">
          <span class="custom">{{ items.length }}</span>
        </template>
      </RefinementList>
    `,
  });

  expect(wrapper.find('.ais-RefinementList .custom').text()).toBe('2');
  expect(wrapper.find('.ais-RefinementList-list').exists()).toBe(false);
});

it('searches for items from the search box', async () => {
  const searchForItems = jest.fn();
  __setState({ ...defaultState, searchForItems });

  const wrapper = mount(RefinementList, {
    propsData: { ...defaultProps, searchable: true },
  });

  const input = wrapper.find('.ais-SearchBox-input');
  input.element.value = 'app';
  await input.trigger('input');

  expect(searchForItems).toHaveBeenCalledWith('app');
  expect(input.element.value).toBe('app');
});
