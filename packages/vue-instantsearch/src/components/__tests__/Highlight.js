import { mount } from '@vue/test-utils';
import Highlight from '../Highlight.vue';

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
