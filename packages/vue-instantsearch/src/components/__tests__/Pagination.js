/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Pagination from '../Pagination.vue';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

function createState(state = {}) {
  return {
    pages: [0, 1, 2],
    currentRefinement: 0,
    nbHits: 30,
    nbPages: 3,
    isFirstPage: true,
    isLastPage: false,
    createURL: (page) => `/?page=${page + 1}`,
    refine: jest.fn(),
    ...state,
  };
}

describe('Pagination', () => {
  it('renders the shared markup', () => {
    __setState(createState());

    const wrapper = mount(Pagination);

    expect(
      wrapper
        .findAll('.ais-Pagination-link')
        .wrappers.map((link) => [link.element.tagName, link.text()])
    ).toEqual([
      ['SPAN', '‹‹'],
      ['SPAN', '‹'],
      ['A', '1'],
      ['A', '2'],
      ['A', '3'],
      ['A', '›'],
      ['A', '››'],
    ]);
  });

  it('refines and emits `page-change` on click', async () => {
    const state = createState();
    __setState(state);

    const wrapper = mount(Pagination);

    await wrapper.find('.ais-Pagination-item--nextPage a').trigger('click');

    expect(state.refine).toHaveBeenCalledWith(1);
    expect(wrapper.emitted('page-change')).toEqual([[1]]);
  });

  it('maps `class-names` onto the shared class names', () => {
    __setState(createState());

    const wrapper = mount(Pagination, {
      propsData: {
        classNames: {
          'ais-Pagination': 'ROOT',
          'ais-Pagination-item': 'ITEM',
          'ais-Pagination-item--firstPage': 'FIRST',
          'ais-Pagination-item--disabled': 'DISABLED',
          'ais-Pagination-item--selected': 'SELECTED',
          'ais-Pagination-link': 'LINK',
        },
      },
    });

    expect(wrapper.find('.ais-Pagination').classes()).toContain('ROOT');
    expect(wrapper.find('.ais-Pagination-item--firstPage').classes()).toEqual(
      expect.arrayContaining(['ITEM', 'FIRST', 'DISABLED'])
    );
    expect(wrapper.find('.ais-Pagination-item--selected').classes()).toEqual(
      expect.arrayContaining(['ITEM', 'SELECTED'])
    );
    expect(wrapper.find('.ais-Pagination-link').classes()).toContain('LINK');
  });

  it('replaces the links with the item slots', async () => {
    const state = createState();
    __setState(state);

    const wrapper = mount({
      components: { Pagination },
      template: `
        <Pagination>
          <template v-slot:first="{ isFirstPage }">
            <span class="first">first {{ isFirstPage }}</span>
          </template>
          <template v-slot:item="{ page, createURL, refine }">
            <button class="page" :data-url="createURL()" @click="refine">{{ page }}</button>
          </template>
          <template v-slot:last="{ isLastPage, refine }">
            <button class="last" @click="refine">last {{ isLastPage }}</button>
          </template>
        </Pagination>
      `,
    });

    expect(
      wrapper.find('.ais-Pagination-item--firstPage').element.innerHTML
    ).toBe('<span class="first">first true</span>');
    expect(
      wrapper
        .findAll('.ais-Pagination-item--page .page')
        .wrappers.map((b) => [b.text(), b.attributes('data-url')])
    ).toEqual([
      ['0', '/?page=1'],
      ['1', '/?page=2'],
      ['2', '/?page=3'],
    ]);
    // Items without a slot keep the default link
    expect(
      wrapper.find('.ais-Pagination-item--nextPage .ais-Pagination-link').text()
    ).toBe('›');

    await wrapper.findAll('.page').at(1).trigger('click');
    await wrapper.find('.last').trigger('click');

    expect(state.refine.mock.calls).toEqual([[1], [2]]);
  });

  it('replaces the list with the default slot', () => {
    __setState(createState());

    const wrapper = mount({
      components: { Pagination },
      template: `
        <Pagination>
          <template v-slot="{ currentRefinement, nbPages, isFirstPage, isLastPage }">
            <p>{{ currentRefinement }}/{{ nbPages }} {{ isFirstPage }} {{ isLastPage }}</p>
          </template>
        </Pagination>
      `,
    });

    expect(wrapper.html()).toBe(
      '<div class="ais-Pagination">\n  <p>0/3 true false</p>\n</div>'
    );
  });
});
