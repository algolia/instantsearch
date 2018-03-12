import Vue from 'vue';
import Snippet from '../Snippet';

describe('Snippet', () => {
  function restoreTestProcessEnv() {
    process.env.NODE_ENV = 'test';
  }

  afterEach(restoreTestProcessEnv);

  test('renders proper HTML', () => {
    const result = {
      _snippetResult: {
        attr: {
          value: `con<em>ten</em>t`,
        },
      },
    };

    const vm = new Vue({
      render(h) {
        return h('snippet', {
          props: {
            attributeName: 'attr',
            result,
          },
        });
      },
      components: {
        Snippet,
      },
    }).$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('should render an empty string in production if attribute is not snippeted', () => {
    process.env.NODE_ENV = 'production';
    const result = {
      _snippetResult: {},
    };

    const vm = new Vue({
      render(h) {
        return h('snippet', {
          props: {
            attributeName: 'attr',
            result,
          },
        });
      },
      components: {
        Snippet,
      },
    }).$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('should throw an error when not in production if attribute is not snippeted', () => {
    global.console.error = jest.fn();

    const result = {
      _snippetResult: {},
    };

    new Vue({
      render(h) {
        return h('snippet', {
          props: {
            attributeName: 'attr',
            result,
          },
        });
      },
      components: {
        Snippet,
      },
    }).$mount();

    expect(global.console.error).toHaveBeenCalled();
  });

  test('allows usage of dot delimited path to access nested attribute', () => {
    const result = {
      _snippetResult: {
        attr: {
          nested: {
            value: `nested <em>val</em>`,
          },
        },
      },
    };

    const vm = new Vue({
      render(h) {
        return h('snippet', {
          props: {
            attributeName: 'attr.nested',
            result,
          },
        });
      },
      components: {
        Snippet,
      },
    }).$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});
