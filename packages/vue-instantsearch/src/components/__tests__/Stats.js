/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import '../../../test/utils/sortedHtmlSerializer';
import { __setState } from '../../mixins/widget';
import Stats from '../Stats.vue';

jest.mock('../../mixins/widget');

it('renders correctly', () => {
  __setState({
    hitsPerPage: 50,
    nbPages: 20,
    nbHits: 1000,
    page: 2,
    processingTimeMS: 12,
    query: 'ipho',
    instantSearchInstance: {
      helper: {
        lastResults: [],
      },
    },
  });

  const wrapper = mount(Stats);
  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-Stats">
  <span class="ais-Stats-text">
    1,000 results found in 12ms
  </span>
</div>
`);
});

it('renders correctly (relevant sort)', () => {
  __setState({
    areHitsSorted: true,
    hitsPerPage: 50,
    nbPages: 20,
    nbHits: 1000,
    nbSortedHits: 12,
    page: 2,
    processingTimeMS: 12,
    query: 'ipho',
    instantSearchInstance: {
      helper: {
        lastResults: [],
      },
    },
  });

  const wrapper = mount(Stats);
  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-Stats">
  <span class="ais-Stats-text">
    12 relevant results sorted out of 1,000 found in 12ms
  </span>
</div>
`);
});
