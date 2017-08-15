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
    } else if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `The "${attributeName}" attribute is currently not configured to be highlighted in Algolia.
        See https://www.algolia.com/doc/api-reference/api-parameters/attributesToHighlight/.`
      );
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
