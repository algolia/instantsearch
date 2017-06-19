<script>import { HIGHLIGHT_PRE_TAG, HIGHLIGHT_POST_TAG } from '../store';
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
    if (result._snippetResult && result._snippetResult[attributeName]) {
      attributeValue = result._snippetResult[attributeName].value;
    }

    if (ctx.props.escapeHtml === true) {
      attributeValue = escapeHtml(attributeValue);
    }

    return h('span', {
      class: {
        'ais-snippet': true,
      },
      domProps: {
        innerHTML: attributeValue
          .split(HIGHLIGHT_PRE_TAG)
          .join(`<${tagName}>`)
          .split(HIGHLIGHT_POST_TAG)
          .join(`</${tagName}>`),
      },
    });
  },
};
</script>
