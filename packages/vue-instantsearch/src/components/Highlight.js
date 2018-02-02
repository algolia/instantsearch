import { getPropertyByPath } from '../util/object';
import { warn } from '../util/warn';

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

    const attributePath = `_highlightResult.${attributeName}.value`;
    const attributeValue = getPropertyByPath(result, attributePath);

    if (process.env.NODE_ENV !== 'production' && attributeValue === undefined) {
      warn(
        `The "${attributeName}" attribute might currently not be configured to be highlighted in Algolia.
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
