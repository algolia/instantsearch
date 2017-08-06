import Vue from 'vue';
import Snippet from '../Snippet';

test('renders proper HTML', () => {
  const result = {
    _snippetResult: {
      attr: {
        value: `con<em>ten</em>t`,
      },
    },
  };

  const vm = new Vue({
    template: '<snippet attributeName="attr" :result="result">',
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

test('should render an empty string if attribute is not snippeted', () => {
  const result = {
    _snippetResult: {},
  };

  const vm = new Vue({
    template: '<snippet attributeName="attr" :result="result">',
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
