/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import Snippet from '../Snippet.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.unmock('instantsearch-core/internal');

test('renders proper HTML', () => {
  const hit = {
    _snippetResult: {
      attr: {
        value: `con__ais-highlight__ten__/ais-highlight__t`,
      },
    },
  };

  const wrapper = mount(Snippet, {
    propsData: {
      attribute: 'attr',
      hit,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('renders proper HTML with highlightTagName', () => {
  const hit = {
    _snippetResult: {
      attr: {
        value: `con__ais-highlight__ten__/ais-highlight__t`,
      },
    },
  };

  const wrapper = mount(Snippet, {
    propsData: {
      attribute: 'attr',
      highlightedTagName: 'marquee',
      hit,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('should render an empty string in production if attribute is not snippeted', () => {
  process.env.NODE_ENV = 'production';
  const hit = {
    _snippetResult: {},
  };
  global.console.warn = jest.fn();

  const wrapper = mount(Snippet, {
    propsData: {
      attribute: 'attr',
      hit,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
  expect(global.console.warn).not.toHaveBeenCalled();
});

test('allows usage of dot delimited path to access nested attribute', () => {
  const hit = {
    _snippetResult: {
      attr: {
        nested: {
          value: `nested __ais-highlight__val__/ais-highlight__`,
        },
      },
    },
  };

  const wrapper = mount(Snippet, {
    propsData: {
      attribute: 'attr.nested',
      hit,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});
