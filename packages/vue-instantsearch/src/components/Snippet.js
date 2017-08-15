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
    } else if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `The "${attributeName}" attribute is currently not configured to be snippeted in Algolia.
        See https://www.algolia.com/doc/api-reference/api-parameters/attributesToSnippet/.`
      );
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
