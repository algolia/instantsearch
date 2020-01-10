import { mount } from '@vue/test-utils';
import StateResults from '../StateResults.vue';
import { __setState } from '../../mixins/widget';
jest.mock('../../mixins/widget');

it('renders explanation if no slot is used', () => {
  __setState({
    results: {
      query: 'this is the quer',
      hits: [{ objectID: '1', name: 'one' }, { objectID: '2', name: 'two' }],
      page: 1,
    },
    state: {
      query: 'this is the query',
    },
  });
  const wrapper = mount(StateResults);
  expect(wrapper.html()).toMatchSnapshot();
});

it("doesn't render if no results", () => {
  __setState({});
  const wrapper = mount(StateResults);
  expect(wrapper.html()).toBeUndefined();
});

it('gives state & results to default slot', () => {
  const results = {
    query: 'q',
    hits: [{ objectID: '1', name: 'one' }, { objectID: '2', name: 'two' }],
    page: 1,
  };
  const state = {
    query: 'something',
    disjunctiveFacetsRefinements: {},
    page: 1,
  };

  __setState({
    state,
    results,
  });

  mount(StateResults, {
    scopedSlots: {
      default: props => {
        expect(props).toEqual(expect.objectContaining(results));
        expect(props.results).toEqual(results);
        expect(props.state).toEqual(state);
      },
    },
  });
});

it('allows default slot to render whatever they want', () => {
  const results = {
    query: 'hi',
    hits: [{ objectID: '1', name: 'one' }, { objectID: '2', name: 'two' }],
    page: 1,
  };
  const state = {
    query: 'hi!',
  };
  __setState({
    state,
    results,
  });

  const wrapper = mount(StateResults, {
    scopedSlots: {
      default: `
      <template slot-scope="{ state: { query }, results: { page } }">
        <p v-if="query">
          Query is here, page is {{ page }}
        </p>
        <p v-else>
          There's no query
        </p>
      </template>`,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-StateResults">
  <p>
    Query is here, page is 1
  </p>
</div>

`);
});

it('allows default slot to render whatever they want (truthy query)', () => {
  const results = {
    query: 'hi',
    hits: [{ objectID: '1', name: 'one' }, { objectID: '2', name: 'two' }],
    page: 1,
  };
  const state = {
    query: 'hi!',
  };
  __setState({
    state,
    results,
  });

  const wrapper = mount(StateResults, {
    scopedSlots: {
      default: `
      <template slot-scope="{ results: { query } }">
        <p v-if="query">
          Query is here
        </p>
        <p v-else>
          There's no query
        </p>
      </template>`,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-StateResults">
  <p>
    Query is here
  </p>
</div>

`);
});

it('allows default slot to render whatever they want (falsy query)', () => {
  const results = {
    query: '',
    hits: [{ objectID: '1', name: 'one' }, { objectID: '2', name: 'two' }],
    page: 1,
  };
  const state = {
    query: 'hi!',
  };
  __setState({
    state,
    results,
  });

  const wrapper = mount(StateResults, {
    scopedSlots: {
      default: `
      <template slot-scope="{ results: { query } }">
        <p v-if="query">
          Query is here
        </p>
        <p v-else>
          There's no query
        </p>
      </template>`,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-StateResults">
  <p>
    There's no query
  </p>
</div>

`);
});

describe('legacy spread props', () => {
  it('allows default slot to render whatever they want (truthy query)', () => {
    __setState({
      results: {
        query: 'q',
        hits: [{ objectID: '1', name: 'one' }, { objectID: '2', name: 'two' }],
        page: 1,
      },
      state: {},
    });

    const wrapper = mount(StateResults, {
      scopedSlots: {
        default: `
        <template slot-scope="{ query }">
          <p v-if="query">
            Query is here
          </p>
          <p v-else>
            There's no query
          </p>
        </template>`,
      },
    });

    expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-StateResults">
  <p>
    Query is here
  </p>
</div>

`);
  });

  it('allows default slot to render whatever they want (falsy query)', () => {
    __setState({
      results: {
        query: '',
        hits: [{ objectID: '1', name: 'one' }, { objectID: '2', name: 'two' }],
        page: 1,
      },
      state: {},
    });

    const wrapper = mount(StateResults, {
      scopedSlots: {
        default: `
        <template slot-scope="{ query }">
          <p v-if="query">
            Query is here
          </p>
          <p v-else>
            There's no query
          </p>
        </template>`,
      },
    });

    expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-StateResults">
  <p>
    There's no query
  </p>
</div>

`);
  });
});
