import { getPropertyByPath } from '../util/object';
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

    const attributePath = `_snippetResult.${attributeName}.value`;
    const attributeValue = getPropertyByPath(result, attributePath);

    if (process.env.NODE_ENV !== 'production' && attributeValue === undefined) {
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
