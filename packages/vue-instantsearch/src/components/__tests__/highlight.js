import Vue from 'vue';
import Highlight from '../Highlight';

function restoreTestProcessEnv() {
  process.env.NODE_ENV = 'test';
}

afterEach(restoreTestProcessEnv);

test('renders proper HTML', () => {
  const result = {
    _highlightResult: {
      attr: {
        value: `con<em>ten</em>t`,
      },
    },
  };

  const vm = new Vue({
    render(h) {
      return h('highlight', {
        props: {
          attributeName: 'attr',
          result,
        },
      });
    },
    components: {
      Highlight,
    },
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('should render an empty string in production if attribute is not highlighted', () => {
  process.env.NODE_ENV = 'production';
  const result = {
    _highlightResult: {},
  };

  const vm = new Vue({
    render(h) {
      return h('highlight', {
        props: {
          attributeName: 'attr',
          result,
        },
      });
    },
    components: {
      Highlight,
    },
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('should throw an error when not in production if attribute is not highlighted', () => {
  global.console = { error: jest.fn() };

  const result = {
    _highlightResult: {},
  };

  new Vue({
    render(h) {
      return h('highlight', {
        props: {
          attributeName: 'attr',
          result,
        },
      });
    },
    components: {
      Highlight,
    },
  }).$mount();

  expect(global.console.error).toHaveBeenCalled();
});

test('allows usage of dot delimited path to access nested attribute', () => {
  const result = {
    _highlightResult: {
      attr: {
        nested: {
          value: `nested <em>val</em>`,
        },
      },
    },
  };

  const vm = new Vue({
    render(h) {
      return h('highlight', {
        props: {
          attributeName: 'attr.nested',
          result,
        },
      });
    },
    components: {
      Highlight,
    },
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});
