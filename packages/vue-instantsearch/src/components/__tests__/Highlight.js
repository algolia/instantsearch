/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import Highlight from '../Highlight.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.unmock('instantsearch.js/es');

test('renders proper HTML', () => {
  const hit = {
    _highlightResult: {
      attr: {
        value: `con<mark>ten</mark>t`,
      },
    },
  };

  const wrapper = mount(Highlight, {
    propsData: {
      attribute: 'attr',
      hit,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('renders proper HTML with highlightTagName', () => {
  const hit = {
    _highlightResult: {
      attr: {
        value: `con<mark>ten</mark>t`,
      },
    },
  };

  const wrapper = mount(Highlight, {
    propsData: {
      attribute: 'attr',
      highlightedTagName: 'marquee',
      hit,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('should render an empty string in production if attribute is not highlighted', () => {
  process.env.NODE_ENV = 'production';
  const hit = {
    _highlightResult: {},
  };

  const wrapper = mount(Highlight, {
    propsData: {
      attribute: 'attr',
      hit,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('allows usage of dot delimited path to access nested attribute', () => {
  const hit = {
    _highlightResult: {
      attr: {
        nested: {
          value: `nested <mark>val</mark>`,
        },
      },
    },
  };

  const wrapper = mount(Highlight, {
    propsData: {
      attribute: 'attr.nested',
      hit,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('retains whitespace nodes', () => {
  const hit = {
    _highlightResult: {
      attr: {
        value: `con<mark>tent</mark> <mark>search</mark>ing`,
      },
    },
  };

  const wrapper = mount(Highlight, {
    propsData: {
      attribute: 'attr',
      highlightedTagName: 'marquee',
      hit,
    },
  });

  expect(wrapper.html()).toBe(
    `<span class="ais-Highlight">con<marquee class="ais-Highlight-highlighted">tent</marquee>  <marquee class="ais-Highlight-highlighted">search</marquee>ing</span>`
  );
});
