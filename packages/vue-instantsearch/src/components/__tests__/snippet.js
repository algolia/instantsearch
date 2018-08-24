import { mount } from '@vue/test-utils';
import Snippet from '../Snippet.vue';

afterEach(() => {
  process.env.NODE_ENV = 'test';
});

test('renders proper HTML', () => {
  const hit = {
    _snippetResult: {
      attr: {
        value: `con<em>ten</em>t`,
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
        value: `con<em>ten</em>t`,
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

test('should warn when not in production if attribute is not snippeted', () => {
  global.console.warn = jest.fn();

  const hit = {
    _snippetResult: {},
  };
  mount(Snippet, {
    propsData: {
      attribute: 'attr',
      hit,
    },
  });

  expect(global.console.warn).toHaveBeenCalledTimes(1);
});

test('allows usage of dot delimited path to access nested attribute', () => {
  const hit = {
    _snippetResult: {
      attr: {
        nested: {
          value: `nested <em>val</em>`,
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
