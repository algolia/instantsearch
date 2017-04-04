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

      if (!result._snippetResult || !result._snippetResult[attributeName]) {
        throw new Error(`Attribute ${attributeName} has no snippet.`)
      }

      return h('span', {
          'class': {
            'ais-snippet': true
          },
          domProps: {
            innerHTML: escapeHtml(result._snippetResult[attributeName].value)
            .replace(HIGHLIGHT_PRE_TAG, `<${tagName}>`)
            .replace(HIGHLIGHT_POST_TAG, `</${tagName}>`)
          }
        }
      )
    }
  }
</script>
