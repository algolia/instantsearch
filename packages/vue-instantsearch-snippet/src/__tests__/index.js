import Snippet from 'vue-instantsearch-snippet';
import Vue from 'vue';
import { HIGHLIGHT_PRE_TAG, HIGHLIGHT_POST_TAG } from 'instantsearch-store';

test('renders proper HTML', () => {
  const result = {
    _snippetResult: {
      attr: {
        value: `con${HIGHLIGHT_PRE_TAG}ten${HIGHLIGHT_POST_TAG}t`
      }
    }
  };

  const vm = new Vue({
    template: '<snippet attributeName="attr" :result="result">',
    render(h) {
      return h('snippet', {
        props: {
          attributeName: 'attr',
          result: result
        }
      });
    },
    components: {
      Snippet
    }
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('accepts custom highlighting tag', () => {
  const result = {
    _snippetResult: {
      attr: {
        value: `con${HIGHLIGHT_PRE_TAG}ten${HIGHLIGHT_POST_TAG}t`
      }
    }
  };

  const vm = new Vue({
    template: '<snippet attributeName="attr" :result="result">',
    render(h) {
      return h('snippet', {
        props: {
          attributeName: 'attr',
          result: result,
          tagName: 'em'
        }
      });
    },
    components: {
      Snippet
    }
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('protects against XSS', () => {
  const result = {
    _snippetResult: {
      attr: {
        value: "<script>alert('test');</script>"
      }
    }
  };

  const vm = new Vue({
    template: '<snippet attributeName="attr" :result="result">',
    render(h) {
      return h('snippet', {
        props: {
          attributeName: 'attr',
          result: result
        }
      });
    },
    components: {
      Snippet
    }
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('allows unsafe output', () => {
  const result = {
    _snippetResult: {
      attr: {
        value: '<strong>un-escaped output</strong>'
      }
    }
  };

  const vm = new Vue({
    template: '<snippet attributeName="attr" :result="result">',
    render(h) {
      return h('snippet', {
        props: {
          attributeName: 'attr',
          result: result,
          escapeHtml: false
        }
      });
    },
    components: {
      Snippet
    }
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('should render an empty string if attribute is not snippeted', () => {
  const result = {
    _snippetResult: {}
  };

  const vm = new Vue({
    template: '<snippet attributeName="attr" :result="result">',
    render(h) {
      return h('snippet', {
        props: {
          attributeName: 'attr',
          result: result
        }
      });
    },
    components: {
      Snippet
    }
  }).$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});
