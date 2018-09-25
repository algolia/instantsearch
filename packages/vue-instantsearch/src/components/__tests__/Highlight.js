import { mount } from '@vue/test-utils';
import Highlight from '../Highlight.vue';

afterEach(() => {
  process.env.NODE_ENV = 'test';
});

test('renders proper HTML', () => {
  const hit = {
    _highlightResult: {
      attr: {
        value: `con<em>ten</em>t`,
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
        value: `con<em>ten</em>t`,
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

test('should warn when not in production if attribute is not highlighted', () => {
  global.console.warn = jest.fn();

  const hit = {
    _highlightResult: {},
  };

  mount(Highlight, {
    propsData: {
      attribute: 'attr',
      hit,
    },
  });

  expect(global.console.warn).toHaveBeenCalledTimes(1);
});

test('allows usage of dot delimited path to access nested attribute', () => {
  const hit = {
    _highlightResult: {
      attr: {
        nested: {
          value: `nested <em>val</em>`,
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
