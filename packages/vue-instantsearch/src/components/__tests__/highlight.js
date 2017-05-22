import Vue from 'vue';
import {
  Highlight,
  HIGHLIGHT_PRE_TAG,
  HIGHLIGHT_POST_TAG,
} from 'vue-instantsearch';

test('renders proper HTML', () => {
  const result = {
    _highlightResult: {
      attr: {
        value: `con${HIGHLIGHT_PRE_TAG}ten${HIGHLIGHT_POST_TAG}t`,
      },
    },
  };

  const vm = new Vue({
    template: '<highlight attributeName="attr" :result="result">',
    render(h) {
      return h('highlight', {
        props: {
          attributeName: 'attr',
          result: result,
        },
      });
    },
    components: {
      Highlight,
    },
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('accepts custom highlighting tag', () => {
  const result = {
    _highlightResult: {
      attr: {
        value: `con${HIGHLIGHT_PRE_TAG}ten${HIGHLIGHT_POST_TAG}t`,
      },
    },
  };

  const vm = new Vue({
    template: '<highlight attributeName="attr" :result="result">',
    render(h) {
      return h('highlight', {
        props: {
          attributeName: 'attr',
          result: result,
          tagName: 'em',
        },
      });
    },
    components: {
      Highlight,
    },
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('protects against XSS', () => {
  const result = {
    _highlightResult: {
      attr: {
        value: "<script>alert('test');</script>",
      },
    },
  };

  const vm = new Vue({
    template: '<highlight attributeName="attr" :result="result">',
    render(h) {
      return h('highlight', {
        props: {
          attributeName: 'attr',
          result: result,
        },
      });
    },
    components: {
      Highlight,
    },
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('allows unsafe output', () => {
  const result = {
    _highlightResult: {
      attr: {
        value: '<strong>un-escaped output</strong>',
      },
    },
  };

  const vm = new Vue({
    template: '<highlight attributeName="attr" :result="result">',
    render(h) {
      return h('highlight', {
        props: {
          attributeName: 'attr',
          result: result,
          escapeHtml: false,
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
          result: result,
        },
      });
    },
    components: {
      Highlight,
    },
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});
