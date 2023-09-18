/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import CurrentRefinements from '../CurrentRefinements.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

describe('custom render', () => {
  const defaultSlot = `
    <template v-slot="{ refine, items, createURL }">
      <div>
        <ul>
          <li
            v-for="item in items"
            :key="item.attribute"
            >
            {{item.label}}:
            <button
              v-for="refinement in item.refinements"
              @click="item.refine(refinement)"
              :key="refinement.value"
            >
              {{refinement.label}} ╳
            </button>
          </li>
        </ul>
      </div>
    </template>
  `;

  const itemSlot = `
    <template v-slot:item="{ item, refine }">
      <div>
        {{item.label}}:
        <button
          v-for="refinement in item.refinements"
          @click="item.refine(refinement)"
          :key="refinement.value"
        >
          {{refinement.label}}
        </button>
      </div>
    </template>
  `;

  const refinementSlot = `
    <template v-slot:refinement="{ refinement, refine, createURL }">
      <div>
        <button
          @click="refine(refinement)"
        >
          <pre>{{refinement}}</pre>
        </button>
      </div>
    </template>
  `;

  const items = [
    {
      attribute: 'brands',
      label: 'brands',
      refinements: [
        {
          attribute: 'brands',
          type: 'facet',
          value: 'apple',
          label: 'apple',
        },
      ],
    },
    {
      attribute: 'colors',
      label: 'colors',
      refinements: [
        {
          attribute: 'colors',
          type: 'facet',
          value: 'red',
          label: 'red',
        },
      ],
    },
  ];

  it('gives all relevant info to scoped slot', () => {
    __setState({
      items,
      createURL: jest.fn(
        ({ attributeName, computedLabel }) =>
          `?${attributeName}=${computedLabel}`
      ),
    });

    const wrapper = mount({
      components: { CurrentRefinements },
      template: `
        <CurrentRefinements>
          ${defaultSlot}
        </CurrentRefinements>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('has same amount of items', () => {
    __setState({
      items,
      createURL: jest.fn(
        ({ attributeName, computedLabel }) =>
          `?${attributeName}=${computedLabel}`
      ),
    });

    const wrapper = mount({
      components: { CurrentRefinements },
      template: `
        <CurrentRefinements>
          ${defaultSlot}
        </CurrentRefinements>
      `,
    });

    expect(wrapper.findAll('button')).toHaveLength(items.length);
  });

  it('item slot gives all relevant info to scoped slot', () => {
    __setState({
      items,
      createURL: jest.fn(
        ({ attributeName, computedLabel }) =>
          `?${attributeName}=${computedLabel}`
      ),
    });

    const wrapper = mount({
      components: { CurrentRefinements },
      template: `
        <CurrentRefinements>
          ${itemSlot}
        </CurrentRefinements>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('item slot has same amount of items', () => {
    __setState({
      items,
      createURL: jest.fn(
        ({ attributeName, computedLabel }) =>
          `?${attributeName}=${computedLabel}`
      ),
    });

    const wrapper = mount({
      components: { CurrentRefinements },
      template: `
        <CurrentRefinements>
          ${itemSlot}
        </CurrentRefinements>
      `,
    });

    expect(wrapper.findAll('button')).toHaveLength(items.length);
  });

  it('refinement slot has same amount of items', () => {
    __setState({
      items,
      createURL: jest.fn(
        ({ attributeName, computedLabel }) =>
          `?${attributeName}=${computedLabel}`
      ),
    });

    const wrapper = mount({
      components: { CurrentRefinements },
      template: `
        <CurrentRefinements>
          ${refinementSlot}
        </CurrentRefinements>
      `,
    });

    expect(wrapper.findAll('button')).toHaveLength(items.length);
  });
});
