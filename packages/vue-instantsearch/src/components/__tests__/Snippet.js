import { mount } from '@vue/test-utils';
import Snippet from '../Snippet.vue';

jest.unmock('instantsearch.js/es');

test('renders proper HTML', () => {
  const hit = {
    _snippetResult: {
      attr: {
        value: `con<mark>ten</mark>t`,
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
        value: `con<mark>ten</mark>t`,
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
          value: `nested <mark>val</mark>`,
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
