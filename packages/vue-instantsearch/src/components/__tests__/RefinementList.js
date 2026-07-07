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
    { value: 'Apple', label: 'Apple', highlighted: 'Apple', count: 746, isRefined: false },
    { value: 'Samsung', label: 'Samsung', highlighted: 'Samsung', count: 633, isRefined: false },
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
