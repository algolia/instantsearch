import Vue from 'vue';
import Highlight from '../Highlight';

test('renders proper HTML', () => {
  const result = {
    _highlightResult: {
      attr: {
        value: `con<em>ten</em>t`,
      },
    },
  };

  const vm = new Vue({
    template: '<highlight attributeName="attr" :result="result">',
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

test('should render an empty string if attribute is not highlighted', () => {
  const result = {
    _highlightResult: {},
  };

  const vm = new Vue({
    template: '<highlight attributeName="attr" :result="result">',
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
