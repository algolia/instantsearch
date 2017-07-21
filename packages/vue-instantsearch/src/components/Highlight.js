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
    if (result._highlightResult && result._highlightResult[attributeName]) {
      attributeValue = result._highlightResult[attributeName].value;
    }

    return h('span', {
      class: {
        'ais-highlight': true,
      },
      domProps: {
        innerHTML: attributeValue,
      },
    });
  },
};
