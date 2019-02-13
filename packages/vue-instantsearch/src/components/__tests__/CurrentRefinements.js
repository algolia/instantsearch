import { mount } from '@vue/test-utils';
import CurrentRefinements from '../CurrentRefinements.vue';
import { __setState } from '../../mixins/widget';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

it('renders correctly (empty)', () => {
  __setState({
    items: [],
  });
  const wrapper = mount(CurrentRefinements);
  expect(wrapper.html()).toMatchSnapshot();
});

describe.each([
  [
    'facet',
    [
      {
        attribute: 'customFacet',
        label: 'customFacet',
        refinements: [
          {
            attribute: 'customFacet',
            type: 'facet',
            value: 'val1',
            label: 'val1',
          },
        ],
      },
    ],
  ],
  [
    'facet exclude',
    [
      {
        attribute: 'customExcludeFacet',
        label: 'customExcludeFacet',
        refinements: [
          {
            attribute: 'customExcludeFacet',
            type: 'exclude',
            value: 'val1',
            label: 'val1',
            exclude: true,
          },
        ],
      },
    ],
  ],
  [
    'disjunctive facet',
    [
      {
        attribute: 'customDisjunctiveFacet',
        label: 'customDisjunctiveFacet',
        refinements: [
          {
            attribute: 'customDisjunctiveFacet',
            type: 'disjunctive',
            value: 'val1',
            label: 'val1',
          },
        ],
      },
    ],
  ],
  [
    'hierarchical facet',
    [
      {
        attribute: 'customHierarchicalFacet',
        label: 'customHierarchicalFacet',
        refinements: [
          {
            attribute: 'customHierarchicalFacet',
            type: 'hierarchical',
            value: 'val1',
            label: 'val1',
          },
        ],
      },
    ],
  ],
  [
    'numeric filters',
    [
      {
        attribute: 'customNumericFilter',
        label: 'customNumericFilter',
        refinements: [
          {
            attribute: 'customNumericFilter',
            type: 'numeric',
            operator: '=',
            value: 'val1',
            label: '= val1',
          },
          {
            attribute: 'customNumericFilter',
            type: 'numeric',
            operator: '<=',
            value: 'val2',
            label: '≤ val2',
          },
          {
            attribute: 'customNumericFilter',
            type: 'numeric',
            operator: '>=',
            value: 'val3',
            label: '≥ val3',
          },
        ],
      },
    ],
  ],
  [
    'tag',
    [
      {
        attribute: '_tags',
        label: '_tags',
        refinements: [
          {
            attribute: '_tags',
            type: 'tag',
            value: 'tag1',
            label: 'tag1',
          },
        ],
      },
    ],
  ],
  [
    'query',
    [
      {
        attribute: 'query',
        label: 'query',
        refinements: [
          {
            attribute: 'query',
            type: 'query',
            value: 'search1',
            label: 'search1',
          },
        ],
      },
    ],
  ],
])('%s', (name, items) => {
  it('renders correct html', () => {
    __setState({
      items,
    });

    const wrapper = mount(CurrentRefinements);

    if (name === 'query') {
      expect(
        wrapper.find('.ais-CurrentRefinements-categoryLabel').contains('q')
      ).toBe(true);
    }

    expect(wrapper.html()).toMatchSnapshot();
  });
});

it('calls `refine` with a refinement', () => {
  const spies = [jest.fn(), jest.fn()];

  __setState({
    items: [
      {
        attribute: 'brands',
        label: 'brands',
        refine: spies[0],
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
        refine: spies[1],
        refinements: [
          {
            attribute: 'colors',
            type: 'facet',
            value: 'green',
            label: 'green',
          },
        ],
      },
    ],
  });

  const wrapper = mount(CurrentRefinements);
  wrapper.find('.ais-CurrentRefinements-delete').trigger('click');

  expect(spies[0]).toHaveBeenLastCalledWith({
    attribute: 'brands',
    label: 'apple',
    type: 'facet',
    value: 'apple',
  });

  expect(spies[1]).not.toHaveBeenCalled();
});

describe('custom render', () => {
  const defaultScopedSlot = `
    <div slot-scope="{ refine, items, createURL }">
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
  `;

  const itemScopedSlot = `
    <div slot-scope="{ item, refine }">
      {{item.label}}: 
      <button
        v-for="refinement in item.refinements"
        @click="item.refine(refinement)"
        :key="refinement.value"
      >
        {{refinement.label}}
      </button>
    </div>
  `;

  const refinementScopedSlot = `
    <div slot-scope="{ refinement, refine, createURL }">
      <button
        @click="refine(refinement)"
      >
        <pre>{{refinement}}</pre>
      </button>
    </div>
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

    const wrapper = mount(CurrentRefinements, {
      scopedSlots: {
        default: defaultScopedSlot,
      },
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

    const wrapper = mount(CurrentRefinements, {
      scopedSlots: {
        default: defaultScopedSlot,
      },
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

    const wrapper = mount(CurrentRefinements, {
      scopedSlots: {
        item: itemScopedSlot,
      },
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

    const wrapper = mount(CurrentRefinements, {
      scopedSlots: {
        item: itemScopedSlot,
      },
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

    const wrapper = mount(CurrentRefinements, {
      scopedSlots: {
        refinement: refinementScopedSlot,
      },
    });

    expect(wrapper.findAll('button')).toHaveLength(items.length);
  });
});
