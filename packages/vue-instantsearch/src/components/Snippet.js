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
  },
  render(h, ctx) {
    const result = ctx.props.result;
    const attributeName = ctx.props.attributeName;

    let attributeValue = '';
    if (result._snippetResult && result._snippetResult[attributeName]) {
      attributeValue = result._snippetResult[attributeName].value;
    }

    return h('span', {
      class: {
        'ais-snippet': true,
      },
      domProps: {
        innerHTML: attributeValue,
      },
    });
  },
};
