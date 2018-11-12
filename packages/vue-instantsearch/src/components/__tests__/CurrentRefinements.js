import { mount } from '@vue/test-utils';
import CurrentRefinements from '../CurrentRefinements.vue';
import { __setState } from '../../mixins/widget';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

it('TransformItems happens after excludedAttributes', () => {
  __setState({
    refinements: [
      { type: 'query', query: 'hi there everyone!' },
      { type: 'disjunctive', attributeName: 'brand', value: 'Insignia™' },
    ],
  });

  const transformItems = items => {
    expect(items).toHaveLength(0);
    return [
      { type: 'query', attribute: 'query', query: 'dogs' },
      { type: 'disjunctive', attribute: 'brand', value: 'Insignia™' },
    ];
  };

  const wrapper = mount(CurrentRefinements, {
    propsData: {
      transformItems,
      excludedAttributes: ['query', 'brand'],
    },
  });

  expect(wrapper.vm.refinements).toHaveLength(2);
  expect(wrapper.vm.refinements[0]).toEqual(
    expect.objectContaining({
      type: 'query',
      attribute: 'query',
      query: 'dogs',
    })
  );
  expect(wrapper.vm.refinements[1]).toEqual(
    expect.objectContaining({
      type: 'disjunctive',
      attribute: 'brand',
      value: 'Insignia™',
    })
  );
});

it("transformItems happens after excludedAttributes (so it doesn't include query by default)", () => {
  __setState({
    refinements: [
      { type: 'query', query: 'hi there everyone!' },
      { type: 'disjunctive', attribute: 'brand', value: 'Insignia™' },
    ],
  });

  const transformItems = items =>
    items.filter(({ attribute }) => attribute === 'query');

  const wrapper = mount(CurrentRefinements, {
    propsData: {
      transformItems,
    },
  });

  expect(wrapper.vm.refinements).toHaveLength(0);
});

it('renders correctly (empty)', () => {
  __setState({
    refinements: [],
  });
  const wrapper = mount(CurrentRefinements);
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly (with refinements)', () => {
  __setState({
    refinements: [
      {
        computedLabel: 'some query',
        name: 'some query',
        query: 'some query',
        type: 'query',
      },
      {
        attributeName: 'brands',
        computedLabel: 'apple',
      },
      {
        attributeName: 'colors',
        computedLabel: 'red',
      },
      {
        attributeName: 'requirements',
        computedLabel: 'free',
      },
    ],
  });
  const wrapper = mount(CurrentRefinements);
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly (with duplicate refinements)', () => {
  __setState({
    refinements: [
      {
        computedLabel: 'some query',
        name: 'some query',
        query: 'some query',
        type: 'query',
      },
      {
        attributeName: 'brands',
        computedLabel: 'apple',
      },
      {
        attributeName: 'brands',
        computedLabel: 'samsung',
      },
    ],
  });
  const wrapper = mount(CurrentRefinements);
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly (with query)', () => {
  __setState({
    refinements: [
      {
        computedLabel: 'some query',
        name: 'some query',
        query: 'some query',
        type: 'query',
      },
      {
        attributeName: 'brands',
        computedLabel: 'apple',
      },
      {
        attributeName: 'colors',
        computedLabel: 'red',
      },
      {
        attributeName: 'requirements',
        computedLabel: 'free',
      },
    ],
  });
  const wrapper = mount(CurrentRefinements, {
    propsData: { excludedAttributes: [] },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

it('default value of excludedAttributes is ["query"]', () => {
  __setState({
    refinements: [
      {
        computedLabel: 'some query',
        name: 'some query',
        query: 'some query',
        type: 'query',
      },
    ],
  });
  const wrapper = mount(CurrentRefinements);
  expect(wrapper.html()).toMatchSnapshot();

  const labels = wrapper.findAll('.ais-CurrentRefinements-label');
  expect(labels).toHaveLength(0);
});

it('includedAttributes overrides excludedAttributes (also for query)', () => {
  __setState({
    refinements: [
      {
        computedLabel: 'some query',
        name: 'some query',
        query: 'some query',
        type: 'query',
      },
      {
        attributeName: 'hi there',
      },
    ],
  });
  const wrapper = mount(CurrentRefinements, {
    propsData: {
      includedAttributes: ['query'],
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
  const label = wrapper.find('.ais-CurrentRefinements-label');

  expect(label.text()).toMatch(/Query/);
});

it('includedAttributes overrides excludedAttributes', () => {
  __setState({
    refinements: [
      {
        computedLabel: 'some query',
        name: 'some query',
        query: 'some query',
        type: 'query',
      },
      {
        attributeName: 'hi there',
      },
    ],
  });
  const wrapper = mount(CurrentRefinements, {
    propsData: {
      includedAttributes: ['hi there'],
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
  const label = wrapper.find('.ais-CurrentRefinements-label');

  expect(label.text()).toMatch(/Hi there/);
});

it('calls `refine` with an item', () => {
  __setState({
    refinements: [
      {
        attributeName: 'brands',
        computedLabel: 'apple',
      },
      {
        attributeName: 'colors',
        computedLabel: 'red',
      },
      {
        attributeName: 'requirements',
        computedLabel: 'free',
      },
    ],
    refine: jest.fn(),
  });
  const wrapper = mount(CurrentRefinements);
  wrapper.find('.ais-CurrentRefinements-delete').trigger('click');

  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith({
    attributeName: 'brands',
    computedLabel: 'apple',
  });
});

describe('custom render', () => {
  const defaultScopedSlot = `
    <div slot-scope="{ items, createURL, refine }">
      <div v-for="item in items" :key="item.attributeName">
        <button
          @click="refine(item.value)"
        >
          <a :href="createURL(item.value)">
            url
          </a>
          <pre>{{item}}</pre>
        </button>
      </div>
    </div>
  `;

  const itemScopedSlot = `
    <div slot-scope="{ item, createURL, refine }">
      <button
        @click="refine()"
      >
        <a :href="createURL()">
          url
        </a>
        <pre>{{item}}</pre>
      </button>
    </div>
  `;

  const refinements = [
    {
      attributeName: 'brands',
      computedLabel: 'apple',
    },
    {
      attributeName: 'colors',
      computedLabel: 'red',
    },
    {
      attributeName: 'requirements',
      computedLabel: 'free',
    },
  ];

  it('gives all relevant info to scoped slot', () => {
    __setState({
      refinements,
      refine: jest.fn(),
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
      refinements,
      refine: jest.fn(),
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

    expect(wrapper.findAll('button')).toHaveLength(refinements.length);
  });

  it('creates URLs', () => {
    __setState({
      refinements,
      refine: jest.fn(),
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

    expect(
      wrapper
        .findAll('button a')
        .filter(link => Boolean(link.attributes('href')))
    ).toHaveLength(refinements.length);
  });

  it('item slot gives all relevant info to scoped slot', () => {
    __setState({
      refinements,
      refine: jest.fn(),
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
      refinements,
      refine: jest.fn(),
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

    expect(wrapper.findAll('button')).toHaveLength(refinements.length);
  });

  it('item slot has URLs', () => {
    __setState({
      refinements,
      refine: jest.fn(),
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

    expect(
      wrapper
        .findAll('button a')
        .filter(link => Boolean(link.attributes('href')))
    ).toHaveLength(refinements.length);
  });
});
