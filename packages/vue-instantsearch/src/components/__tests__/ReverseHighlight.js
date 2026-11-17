/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import ReverseHighlight from '../ReverseHighlight.vue';

jest.unmock('instantsearch-core/internal');

// "content", with "ten" matched by the query.
const highlightedHit = {
  _highlightResult: {
    attr: {
      value: 'con__ais-highlight__ten__/ais-highlight__t',
    },
  },
};

function mountReverseHighlight(propsData = {}) {
  return mount(ReverseHighlight, {
    propsData: { attribute: 'attr', hit: highlightedHit, ...propsData },
  });
}

test('marks the parts the query did not match', () => {
  const wrapper = mountReverseHighlight();
  const highlighted = wrapper.findAll('.ais-ReverseHighlight-highlighted');

  expect(wrapper.find('.ais-ReverseHighlight').text()).toBe('content');
  expect(highlighted).toHaveLength(2);
  expect(highlighted.at(0).text()).toBe('con');
  expect(highlighted.at(1).text()).toBe('t');
});

test('marks them in the highlighted tag name', () => {
  const wrapper = mountReverseHighlight({ highlightedTagName: 'em' });

  expect(
    wrapper.find('.ais-ReverseHighlight-highlighted').element.tagName
  ).toBe('EM');
});

test('marks an array-valued attribute, joining the values', () => {
  const wrapper = mount(ReverseHighlight, {
    propsData: {
      attribute: 'attr',
      hit: {
        _highlightResult: {
          attr: [
            { value: 'con__ais-highlight__ten__/ais-highlight__t' },
            {
              value: 'nothing __ais-highlight__matched__/ais-highlight__ here',
            },
          ],
        },
      },
    },
  });

  expect(wrapper.find('.ais-ReverseHighlight').text()).toBe(
    'content, nothing matched here'
  );

  const marked = Array.from(
    wrapper.element.querySelectorAll('.ais-ReverseHighlight-highlighted')
  ).map((element) => element.textContent.trim());

  expect(marked).toEqual(['con', 't', 'nothing', 'here']);
});

test('allows usage of dot delimited path to access nested attribute', () => {
  const wrapper = mount(ReverseHighlight, {
    propsData: {
      attribute: 'attr.nested',
      hit: {
        _highlightResult: {
          attr: {
            nested: {
              value: 'nested __ais-highlight__val__/ais-highlight__',
            },
          },
        },
      },
    },
  });

  const highlighted = wrapper.findAll('.ais-ReverseHighlight-highlighted');

  expect(highlighted).toHaveLength(1);
  expect(highlighted.at(0).text()).toBe('nested');
});
