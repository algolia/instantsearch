<script>
import { HIGHLIGHT_PRE_TAG, HIGHLIGHT_POST_TAG } from 'instantsearch-store';
import escapeHtml from 'escape-html';

export default {
  functional: true,
  props: {
    result: {
      type: Object,
      required: true,
    },
    attributeName: {
      type: String,
      required: true,
    },
    tagName: {
      type: String,
      default: 'mark',
    },
    escapeHtml: {
      type: Boolean,
      default: true,
    },
  },
  render(h, ctx) {
    const result = ctx.props.result;
    const attributeName = ctx.props.attributeName;
    const tagName = ctx.props.tagName;

    let attributeValue = '';
    if (result._highlightResult && result._highlightResult[attributeName]) {
      attributeValue = result._highlightResult[attributeName].value;
    }

    if (ctx.props.escapeHtml === true) {
      attributeValue = escapeHtml(attributeValue);
    }

    return h('span', {
      class: {
        'ais-highlight': true,
      },
      domProps: {
        innerHTML: attributeValue
          .replace(HIGHLIGHT_PRE_TAG, `<${tagName}>`)
          .replace(HIGHLIGHT_POST_TAG, `</${tagName}>`),
      },
    });
  },
};
</script>
