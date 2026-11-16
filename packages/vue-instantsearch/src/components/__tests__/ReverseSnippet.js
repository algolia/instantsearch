/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import ReverseSnippet from '../ReverseSnippet.vue';

jest.unmock('instantsearch-core/internal');

// "content", with "ten" matched by the query.
const snippetedHit = {
  _snippetResult: {
    attr: {
      value: 'con__ais-highlight__ten__/ais-highlight__t',
    },
  },
};

function mountReverseSnippet(propsData = {}) {
  return mount(ReverseSnippet, {
    propsData: { attribute: 'attr', hit: snippetedHit, ...propsData },
  });
}

test('marks the parts the query did not match', () => {
  const wrapper = mountReverseSnippet();
  const highlighted = wrapper.findAll('.ais-ReverseSnippet-highlighted');

  expect(wrapper.find('.ais-ReverseSnippet').text()).toBe('content');
  expect(highlighted).toHaveLength(2);
  expect(highlighted.at(0).text()).toBe('con');
  expect(highlighted.at(1).text()).toBe('t');
});

test('marks them in the highlighted tag name', () => {
  const wrapper = mountReverseSnippet({ highlightedTagName: 'em' });

  expect(wrapper.find('.ais-ReverseSnippet-highlighted').element.tagName).toBe(
    'EM'
  );
});

test('allows usage of dot delimited path to access nested attribute', () => {
  const wrapper = mount(ReverseSnippet, {
    propsData: {
      attribute: 'attr.nested',
      hit: {
        _snippetResult: {
          attr: {
            nested: {
              value: 'nested __ais-highlight__val__/ais-highlight__',
            },
          },
        },
      },
    },
  });

  const highlighted = wrapper.findAll('.ais-ReverseSnippet-highlighted');

  expect(highlighted).toHaveLength(1);
  expect(highlighted.at(0).text()).toBe('nested');
});
