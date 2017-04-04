<script>
  import {HIGHLIGHT_PRE_TAG, HIGHLIGHT_POST_TAG} from 'instantsearch-store'
  import escapeHtml from 'escape-html'

  export default {
    functional: true,
    props: {
      result: {
        type: Object,
        required: true
      },
      attributeName: {
        type: String,
        required: true
      },
      tagName: {
        type: String,
        default: 'em'
      }
    },
    render (h, ctx) {
      const result = ctx.props.result
      const attributeName = ctx.props.attributeName
      const tagName = ctx.props.tagName

      if (!result._highlightResult || !result._highlightResult[attributeName]) {
        throw new Error(`Attribute ${attributeName} is not highlighted.`)
      }

      return h('span', {
          'class': {
            'ais-highlight': true
          },
          domProps: {
            innerHTML: escapeHtml(result._highlightResult[attributeName].value)
            .replace(HIGHLIGHT_PRE_TAG, `<${tagName}>`)
            .replace(HIGHLIGHT_POST_TAG, `</${tagName}>`)
          }
        }
      )
    }
  }
</script>
