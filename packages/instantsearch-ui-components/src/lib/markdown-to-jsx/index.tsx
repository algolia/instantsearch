// @ts-nocheck
/* @jsx h */
/**
 * markdown-to-jsx is a fork of
 * [simple-markdown v0.2.2](https://github.com/Khan/simple-markdown)
 * from Khan Academy. Thank you Khan devs for making such an awesome
 * and extensible parsing infra... without it, half of the
 * optimizations here wouldn't be feasible. 🙏🏼
 */
import type { ComponentChildren, ElementType, Pragma } from '../../types'

/**
 * Analogous to `node.type`. Please note that the values here may change at any time,
 * so do not hard code against the value directly.
 */
export const RuleType = {
  blockQuote: '0',
  breakLine: '1',
  breakThematic: '2',
  codeBlock: '3',
  codeFenced: '4',
  codeInline: '5',
  footnote: '6',
  footnoteReference: '7',
  gfmTask: '8',
  heading: '9',
  headingSetext: '10',
  /** only available if not `disableHTMLParsing` */
  htmlBlock: '11',
  htmlComment: '12',
  /** only available if not `disableHTMLParsing` */
  htmlSelfClosing: '13',
  image: '14',
  link: '15',
  /** emits a `link` 'node', does not render directly */
  linkAngleBraceStyleDetector: '16',
  /** emits a `link` 'node', does not render directly */
  linkBareUrlDetector: '17',
  /** @deprecated merged into linkAngleBraceStyleDetector
   *
   * emits a `link` 'node', does not render directly */
  linkMailtoDetector: '18',
  newlineCoalescer: '19',
  orderedList: '20',
  paragraph: '21',
  ref: '22',
  refImage: '23',
  refLink: '24',
  table: '25',
  tableSeparator: '26',
  text: '27',
  textBolded: '28',
  textEmphasized: '29',
  textEscaped: '30',
  textMarked: '31',
  textStrikethroughed: '32',
  unorderedList: '33',
} as const

if (process.env.NODE_ENV === 'test') {
  Object.keys(RuleType).forEach(key => (RuleType[key] = key))
}

export type RuleType = (typeof RuleType)[keyof typeof RuleType]

const Priority = {
  /**
   * anything that must scan the tree before everything else
   */
  MAX: 0,
  /**
   * scans for block-level constructs
   */
  HIGH: 1,
  /**
   * inline w/ more priority than other inline
   */
  MED: 2,
  /**
   * inline elements
   */
  LOW: 3,
  /**
   * bare text and stuff that is considered leftovers
   */
  MIN: 4,
}

/** TODO: Drop for React 16? */
const ATTRIBUTE_TO_JSX_PROP_MAP = [
  'allowFullScreen',
  'allowTransparency',
  'autoComplete',
  'autoFocus',
  'autoPlay',
  'cellPadding',
  'cellSpacing',
  'charSet',
  'classId',
  'colSpan',
  'contentEditable',
  'contextMenu',
  'crossOrigin',
  'encType',
  'formAction',
  'formEncType',
  'formMethod',
  'formNoValidate',
  'formTarget',
  'frameBorder',
  'hrefLang',
  'inputMode',
  'keyParams',
  'keyType',
  'marginHeight',
  'marginWidth',
  'maxLength',
  'mediaGroup',
  'minLength',
  'noValidate',
  'radioGroup',
  'readOnly',
  'rowSpan',
  'spellCheck',
  'srcDoc',
  'srcLang',
  'srcSet',
  'tabIndex',
  'useMap',
].reduce(
  (obj, x) => {
    obj[x.toLowerCase()] = x
    return obj
  },
  { class: 'className', for: 'htmlFor' }
)

const namedCodesToUnicode = {
  amp: '\u0026',
  apos: '\u0027',
  gt: '\u003e',
  lt: '\u003c',
  nbsp: '\u00a0',
  quot: '\u201c',
} as const

const DO_NOT_PROCESS_HTML_ELEMENTS = ['style', 'script', 'pre']
const ATTRIBUTES_TO_SANITIZE = [
  'src',
  'href',
  'data',
  'formAction',
  'srcDoc',
  'action',
]

/**
 * the attribute extractor regex looks for a valid attribute name,
 * followed by an equal sign (whitespace around the equal sign is allowed), followed
 * by one of the following:
 *
 * 1. a single quote-bounded string, e.g. 'foo'
 * 2. a double quote-bounded string, e.g. "bar"
 * 3. an interpolation, e.g. {something}
 *
 * JSX can be be interpolated into itself and is passed through the compiler using
 * the same options and setup as the current run.
 *
 * <Something children={<SomeOtherThing />} />
 *                      ==================
 *                              ↳ children: [<SomeOtherThing />]
 *
 * Otherwise, interpolations are handled as strings or simple booleans
 * unless HTML syntax is detected.
 *
 * <Something color={green} disabled={true} />
 *                   =====            ====
 *                     ↓                ↳ disabled: true
 *                     ↳ color: "green"
 *
 * Numbers are not parsed at this time due to complexities around int, float,
 * and the upcoming bigint functionality that would make handling it unwieldy.
 * Parse the string in your component as desired.
 *
 * <Something someBigNumber={123456789123456789} />
 *                           ==================
 *                                   ↳ someBigNumber: "123456789123456789"
 */
const ATTR_EXTRACTOR_R =
  /([-A-Z0-9_:]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|(?:\{((?:\\.|{[^}]*?}|[^}])*)\})))?/gi

/** TODO: Write explainers for each of these */

const BLOCK_END_R = /\n{2,}$/
const BLOCKQUOTE_R = /^(\s*>[\s\S]*?)(?=\n\n|$)/
const BLOCKQUOTE_TRIM_LEFT_MULTILINE_R = /^ *> ?/gm
const BLOCKQUOTE_ALERT_R = /^(?:\[!([^\]]*)\]\n)?([\s\S]*)/
const BREAK_LINE_R = /^ {2,}\n/
const BREAK_THEMATIC_R = /^(?:([-*_])( *\1){2,}) *(?:\n *)+\n/
const CODE_BLOCK_FENCED_R =
  /^(?: {1,3})?(`{3,}|~{3,}) *(\S+)? *([^\n]*?)?\n([\s\S]*?)(?:\1\n?|$)/
const CODE_BLOCK_R = /^(?: {4}[^\n]+\n*)+(?:\n *)+\n?/
const CODE_INLINE_R = /^(`+)((?:\\`|(?!\1)`|[^`])+)\1/
const CONSECUTIVE_NEWLINE_R = /^(?:\n *)*\n/
const CR_NEWLINE_R = /\r\n?/g

/**
 * Matches footnotes on the format:
 *
 * [^key]: value
 *
 * Matches multiline footnotes
 *
 * [^key]: row
 * row
 * row
 *
 * And empty lines in indented multiline footnotes
 *
 * [^key]: indented with
 *     row
 *
 *     row
 *
 * Explanation:
 *
 * 1. Look for the starting tag, eg: [^key]
 *    ^\[\^([^\]]+)]
 *
 * 2. The first line starts with a colon, and continues for the rest of the line
 *   :(.*)
 *
 * 3. Parse as many additional lines as possible. Matches new non-empty lines that doesn't begin with a new footnote definition.
 *    (\n(?!\[\^).+)
 *
 * 4. ...or allows for repeated newlines if the next line begins with at least four whitespaces.
 *    (\n+ {4,}.*)
 */
const FOOTNOTE_R = /^\[\^([^\]]+)](:(.*)((\n+ {4,}.*)|(\n(?!\[\^).+))*)/

const FOOTNOTE_REFERENCE_R = /^\[\^([^\]]+)]/
const FORMFEED_R = /\f/g
const FRONT_MATTER_R = /^---[ \t]*\n(.|\n)*\n---[ \t]*\n/
const GFM_TASK_R = /^\s*?\[(x|\s)\]/
const HEADING_R = /^ *(#{1,6}) *([^\n]+?)(?: +#*)?(?:\n *)*(?:\n|$)/
const HEADING_ATX_COMPLIANT_R =
  /^ *(#{1,6}) +([^\n]+?)(?: +#*)?(?:\n *)*(?:\n|$)/
const HEADING_SETEXT_R = /^([^\n]+)\n *(=|-)\2{2,} *\n/

/**
 * Explanation:
 *
 * 1. Look for a starting tag, preceded by any amount of spaces
 *    ^ *<
 *
 * 2. Capture the tag name (capture 1)
 *    ([^ >/]+)
 *
 * 3. Ignore a space after the starting tag and capture the attribute portion of the tag (capture 2)
 *     ?([^>]*)>
 *
 * 4. Ensure a matching closing tag is present in the rest of the input string
 *    (?=[\s\S]*<\/\1>)
 *
 * 5. Capture everything until the matching closing tag -- this might include additional pairs
 *    of the same tag type found in step 2 (capture 3)
 *    ((?:[\s\S]*?(?:<\1[^>]*>[\s\S]*?<\/\1>)*[\s\S]*?)*?)<\/\1>
 *
 * 6. Capture excess newlines afterward
 *    \n*
 */
const HTML_BLOCK_ELEMENT_R =
  /^ *(?!<[a-z][^ >/]* ?\/>)<([a-z][^ >/]*) ?((?:[^>]*[^/])?)>\n?(\s*(?:<\1[^>]*?>[\s\S]*?<\/\1>|(?!<\1\b)[\s\S])*?)<\/\1>(?!<\/\1>)\n*/i

const HTML_CHAR_CODE_R = /&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/gi

const HTML_COMMENT_R = /^<!--[\s\S]*?(?:-->)/

/**
 * borrowed from React 15(https://github.com/facebook/react/blob/894d20744cba99383ffd847dbd5b6e0800355a5c/src/renderers/dom/shared/HTMLDOMPropertyConfig.js)
 */
const HTML_CUSTOM_ATTR_R = /^(data|aria|x)-[a-z_][a-z\d_.-]*$/

const HTML_SELF_CLOSING_ELEMENT_R =
  /^ *<([a-z][a-z0-9:]*)(?:\s+((?:<.*?>|[^>])*))?\/?>(?!<\/\1>)(\s*\n)?/i
const INTERPOLATION_R = /^\{.*\}$/
const LINK_AUTOLINK_BARE_URL_R = /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/
const LINK_AUTOLINK_R = /^<([^ >]+[:@\/][^ >]+)>/
const CAPTURE_LETTER_AFTER_HYPHEN = /-([a-z])?/gi
const NP_TABLE_R = /^(\|.*)\n(?: *(\|? *[-:]+ *\|[-| :]*)\n((?:.*\|.*\n)*))?\n?/
const PARAGRAPH_R = /^[^\n]+(?:  \n|\n{2,})/
const REFERENCE_IMAGE_OR_LINK = /^\[([^\]]*)\]:\s+<?([^\s>]+)>?\s*("([^"]*)")?/
const REFERENCE_IMAGE_R = /^!\[([^\]]*)\] ?\[([^\]]*)\]/
const REFERENCE_LINK_R = /^\[([^\]]*)\] ?\[([^\]]*)\]/
const SHOULD_RENDER_AS_BLOCK_R = /(\n|^[-*]\s|^#|^ {2,}|^-{2,}|^>\s)/
const TAB_R = /\t/g
const TABLE_TRIM_PIPES = /(^ *\||\| *$)/g
const TABLE_CENTER_ALIGN = /^ *:-+: *$/
const TABLE_LEFT_ALIGN = /^ *:-+ *$/
const TABLE_RIGHT_ALIGN = /^ *-+: *$/

/**
 * Ensure there's at least one more instance of the delimiter later
 * in the current sequence.
 */
const LOOKAHEAD = (double: number) => `(?=[\\s\\S]+?\\1${double ? '\\1' : ''})`

/**
 * For inline formatting, this partial attempts to ignore characters that
 * may appear in nested formatting that could prematurely trigger detection
 * and therefore miss content that should have been included.
 */
const INLINE_SKIP_R =
  '((?:\\[.*?\\][([].*?[)\\]]|<.*?>(?:.*?<.*?>)?|`.*?`|\\\\\\1|[\\s\\S])+?)'

/**
 * Detect a sequence like **foo** or __foo__. Note that bold has a higher priority
 * than emphasized to support nesting of both since they share a delimiter.
 */
const TEXT_BOLD_R = new RegExp(
  `^([*_])\\1${LOOKAHEAD(1)}${INLINE_SKIP_R}\\1\\1(?!\\1)`
)

/**
 * Detect a sequence like *foo* or _foo_.
 */
const TEXT_EMPHASIZED_R = new RegExp(
  `^([*_])${LOOKAHEAD(0)}${INLINE_SKIP_R}\\1(?!\\1)`
)

/**
 * Detect a sequence like ==foo==.
 */
const TEXT_MARKED_R = new RegExp(`^(==)${LOOKAHEAD(0)}${INLINE_SKIP_R}\\1`)

/**
 * Detect a sequence like ~~foo~~.
 */
const TEXT_STRIKETHROUGHED_R = new RegExp(
  `^(~~)${LOOKAHEAD(0)}${INLINE_SKIP_R}\\1`
)

/**
 * Special case for shortcodes like :big-smile: or :emoji:
 */
const SHORTCODE_R = /^(:[a-zA-Z0-9-_]+:)/

const TEXT_ESCAPED_R = /^\\([^0-9A-Za-z\s])/
const UNESCAPE_R = /\\([^0-9A-Za-z\s])/g

/**
 * Always take the first character, then eagerly take text until a double space
 * (potential line break) or some markdown-like punctuation is reached.
 */
const TEXT_PLAIN_R = /^[\s\S](?:(?!  \n|[0-9]\.|http)[^=*_~\-\n:<`\\\[!])*/

const TRIM_STARTING_NEWLINES = /^\n+/

const HTML_LEFT_TRIM_AMOUNT_R = /^([ \t]*)/

type LIST_TYPE = 1 | 2
const ORDERED: LIST_TYPE = 1
const UNORDERED: LIST_TYPE = 2

const LIST_LOOKBEHIND_R = /(?:^|\n)( *)$/

// recognize a `*` `-`, `+`, `1.`, `2.`... list bullet
const ORDERED_LIST_BULLET = '(?:\\d+\\.)'
const UNORDERED_LIST_BULLET = '(?:[*+-])'

function generateListItemPrefix(type: LIST_TYPE) {
  return (
    '( *)(' +
    (type === ORDERED ? ORDERED_LIST_BULLET : UNORDERED_LIST_BULLET) +
    ') +'
  )
}

// recognize the start of a list item:
// leading space plus a bullet plus a space (`   * `)
const ORDERED_LIST_ITEM_PREFIX = generateListItemPrefix(ORDERED)
const UNORDERED_LIST_ITEM_PREFIX = generateListItemPrefix(UNORDERED)

function generateListItemPrefixRegex(type: LIST_TYPE) {
  return new RegExp(
    '^' +
      (type === ORDERED ? ORDERED_LIST_ITEM_PREFIX : UNORDERED_LIST_ITEM_PREFIX)
  )
}

const ORDERED_LIST_ITEM_PREFIX_R = generateListItemPrefixRegex(ORDERED)
const UNORDERED_LIST_ITEM_PREFIX_R = generateListItemPrefixRegex(UNORDERED)

function generateListItemRegex(type: LIST_TYPE) {
  // recognize an individual list item:
  //  * hi
  //    this is part of the same item
  //
  //    as is this, which is a new paragraph in the same item
  //
  //  * but this is not part of the same item
  return new RegExp(
    '^' +
      (type === ORDERED
        ? ORDERED_LIST_ITEM_PREFIX
        : UNORDERED_LIST_ITEM_PREFIX) +
      '[^\\n]*(?:\\n' +
      '(?!\\1' +
      (type === ORDERED ? ORDERED_LIST_BULLET : UNORDERED_LIST_BULLET) +
      ' )[^\\n]*)*(\\n|$)',
    'gm'
  )
}

const ORDERED_LIST_ITEM_R = generateListItemRegex(ORDERED)
const UNORDERED_LIST_ITEM_R = generateListItemRegex(UNORDERED)

// check whether a list item has paragraphs: if it does,
// we leave the newlines at the end
function generateListRegex(type: LIST_TYPE) {
  const bullet = type === ORDERED ? ORDERED_LIST_BULLET : UNORDERED_LIST_BULLET

  return new RegExp(
    '^( *)(' +
      bullet +
      ') ' +
      '[\\s\\S]+?(?:\\n{2,}(?! )' +
      '(?!\\1' +
      bullet +
      ' (?!' +
      bullet +
      ' ))\\n*' +
      // the \\s*$ here is so that we can parse the inside of nested
      // lists, where our content might end before we receive two `\n`s
      '|\\s*\\n*$)'
  )
}

const ORDERED_LIST_R = generateListRegex(ORDERED)
const UNORDERED_LIST_R = generateListRegex(UNORDERED)

function generateListRule(
  h: any,
  type: LIST_TYPE
): MarkdownToJSX.Rule<
  MarkdownToJSX.OrderedListNode | MarkdownToJSX.UnorderedListNode
> {
  const ordered = type === ORDERED
  const LIST_R = ordered ? ORDERED_LIST_R : UNORDERED_LIST_R
  const LIST_ITEM_R = ordered ? ORDERED_LIST_ITEM_R : UNORDERED_LIST_ITEM_R
  const LIST_ITEM_PREFIX_R = ordered
    ? ORDERED_LIST_ITEM_PREFIX_R
    : UNORDERED_LIST_ITEM_PREFIX_R

  return {
    _qualify: source => LIST_ITEM_PREFIX_R.test(source),
    _match: allowInline(function (source, state) {
      // We only want to break into a list if we are at the start of a
      // line. This is to avoid parsing "hi * there" with "* there"
      // becoming a part of a list.
      // You might wonder, "but that's inline, so of course it wouldn't
      // start a list?". You would be correct! Except that some of our
      // lists can be inline, because they might be inside another list,
      // in which case we can parse with inline scope, but need to allow
      // nested lists inside this inline scope.
      const isStartOfLine = LIST_LOOKBEHIND_R.exec(state.prevCapture)
      const isListAllowed = state.list || (!state.inline && !state.simple)

      if (isStartOfLine && isListAllowed) {
        source = isStartOfLine[1] + source

        return LIST_R.exec(source)
      } else {
        return null
      }
    }),
    _order: Priority.HIGH,
    _parse(capture, parse, state) {
      const bullet = capture[2]
      const start = ordered ? +bullet : undefined
      const items = capture[0]
        // recognize the end of a paragraph block inside a list item:
        // two or more newlines at end end of the item
        .replace(BLOCK_END_R, '\n')
        .match(LIST_ITEM_R)

      let lastItemWasAParagraph = false

      const itemContent = items.map(function (item, i) {
        // We need to see how far indented the item is:
        const space = LIST_ITEM_PREFIX_R.exec(item)[0].length

        // And then we construct a regex to "unindent" the subsequent
        // lines of the items by that amount:
        const spaceRegex = new RegExp('^ {1,' + space + '}', 'gm')

        // Before processing the item, we need a couple things
        const content = item
          // remove indents on trailing lines:
          .replace(spaceRegex, '')
          // remove the bullet:
          .replace(LIST_ITEM_PREFIX_R, '')

        // Handling "loose" lists, like:
        //
        //  * this is wrapped in a paragraph
        //
        //  * as is this
        //
        //  * as is this
        const isLastItem = i === items.length - 1
        const containsBlocks = content.indexOf('\n\n') !== -1

        // Any element in a list is a block if it contains multiple
        // newlines. The last element in the list can also be a block
        // if the previous item in the list was a block (this is
        // because non-last items in the list can end with \n\n, but
        // the last item can't, so we just "inherit" this property
        // from our previous element).
        const thisItemIsAParagraph =
          containsBlocks || (isLastItem && lastItemWasAParagraph)
        lastItemWasAParagraph = thisItemIsAParagraph

        // backup our state for delta afterwards. We're going to
        // want to set state.list to true, and state.inline depending
        // on our list's looseness.
        const oldStateInline = state.inline
        const oldStateList = state.list
        state.list = true

        // Parse inline if we're in a tight list, or block if we're in
        // a loose list.
        let adjustedContent
        if (thisItemIsAParagraph) {
          state.inline = false
          adjustedContent = trimEnd(content) + '\n\n'
        } else {
          state.inline = true
          adjustedContent = trimEnd(content)
        }

        const result = parse(adjustedContent, state)

        // Restore our state before returning
        state.inline = oldStateInline
        state.list = oldStateList

        return result
      })

      return {
        items: itemContent,
        ordered: ordered,
        start: start,
      }
    },
    _render(node, output, state) {
      const Tag = node.ordered ? 'ol' : 'ul'

      return (
        <Tag
          key={state.key}
          start={node.type === RuleType.orderedList ? node.start : undefined}
        >
          {node.items.map(function generateListItem(item, i) {
            return <li key={i}>{output(item, state)}</li>
          })}
        </Tag>
      )
    },
  }
}

const LINK_INSIDE =
  '(?:\\[[^\\[\\]]*(?:\\[[^\\[\\]]*\\][^\\[\\]]*)*\\]|[^\\[\\]])*'
const LINK_HREF_AND_TITLE =
  '\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+[\'"]([\\s\\S]*?)[\'"])?\\s*'
const LINK_R = new RegExp(
  '^\\[(' + LINK_INSIDE + ')\\]\\(' + LINK_HREF_AND_TITLE + '\\)'
)
const IMAGE_R = /^!\[(.*?)\]\( *((?:\([^)]*\)|[^() ])*) *"?([^)"]*)?"?\)/

function isString(value: any): value is string {
  return typeof value === 'string'
}

function trimEnd(str: string) {
  let end = str.length
  while (end > 0 && str[end - 1] <= ' ') end--
  return str.slice(0, end)
}

function startsWith(str: string, prefix: string) {
  return str.startsWith(prefix)
}

function qualifies(
  source: string,
  state: MarkdownToJSX.State,
  qualify: MarkdownToJSX.Rule<any>['_qualify']
) {
  if (Array.isArray(qualify)) {
    for (let i = 0; i < qualify.length; i++) {
      if (startsWith(source, qualify[i])) return true
    }

    return false
  }

  return qualify(source, state)
}

/** Remove symmetrical leading and trailing quotes */
function unquote(str: string) {
  const first = str[0]
  if (
    (first === '"' || first === "'") &&
    str.length >= 2 &&
    str[str.length - 1] === first
  ) {
    return str.slice(1, -1)
  }
  return str
}

// based on https://stackoverflow.com/a/18123682/1141611
// not complete, but probably good enough
export function slugify(str: string) {
  return str
    .replace(/[ÀÁÂÃÄÅàáâãäåæÆ]/g, 'a')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ðÐ]/g, 'd')
    .replace(/[ÈÉÊËéèêë]/g, 'e')
    .replace(/[ÏïÎîÍíÌì]/g, 'i')
    .replace(/[Ññ]/g, 'n')
    .replace(/[øØœŒÕõÔôÓóÒò]/g, 'o')
    .replace(/[ÜüÛûÚúÙù]/g, 'u')
    .replace(/[ŸÿÝý]/g, 'y')
    .replace(/[^a-z0-9- ]/gi, '')
    .replace(/ /gi, '-')
    .toLowerCase()
}

function parseTableAlignCapture(alignCapture: string) {
  if (TABLE_RIGHT_ALIGN.test(alignCapture)) {
    return 'right'
  } else if (TABLE_CENTER_ALIGN.test(alignCapture)) {
    return 'center'
  } else if (TABLE_LEFT_ALIGN.test(alignCapture)) {
    return 'left'
  }

  return null
}

function parseTableRow(
  source: string,
  parse: MarkdownToJSX.NestedParser,
  state: MarkdownToJSX.State,
  tableOutput: boolean
): MarkdownToJSX.ParserResult[][] {
  const prevInTable = state.inTable

  state.inTable = true

  let cells: MarkdownToJSX.ParserResult[][] = [[]]
  let acc = ''

  function flush() {
    if (!acc) return

    const cell = cells[cells.length - 1]
    cell.push.apply(cell, parse(acc, state))
    acc = ''
  }

  source
    .trim()
    // isolate situations where a pipe should be ignored (inline code, escaped, etc)
    .split(/(`[^`]*`|\\\||\|)/)
    .filter(Boolean)
    .forEach((fragment, i, arr) => {
      if (fragment.trim() === '|') {
        flush()

        if (tableOutput) {
          if (i !== 0 && i !== arr.length - 1) {
            // Split the current row
            cells.push([])
          }

          return
        }
      }

      acc += fragment
    })

  flush()

  state.inTable = prevInTable

  return cells
}

function parseTableAlign(source: string /*, parse, state*/) {
  const alignText = source.replace(TABLE_TRIM_PIPES, '').split('|')

  return alignText.map(parseTableAlignCapture)
}

function parseTableCells(
  source: string,
  parse: MarkdownToJSX.NestedParser,
  state: MarkdownToJSX.State
) {
  const rowsText = source.trim().split('\n')

  return rowsText.map(function (rowText) {
    return parseTableRow(rowText, parse, state, true)
  })
}

function parseTable(
  capture: RegExpMatchArray,
  parse: MarkdownToJSX.NestedParser,
  state: MarkdownToJSX.State
) {
  /**
   * The table syntax makes some other parsing angry so as a bit of a hack even if alignment and/or cell rows are missing,
   * we'll still run a detected first row through the parser and then just emit a paragraph.
   */
  state.inline = true
  const align = capture[2] ? parseTableAlign(capture[2]) : []
  const cells = capture[3] ? parseTableCells(capture[3], parse, state) : []
  const header = parseTableRow(capture[1], parse, state, !!cells.length)
  state.inline = false

  return cells.length
    ? {
        align: align,
        cells: cells,
        header: header,
        type: RuleType.table,
      }
    : {
        children: header,
        type: RuleType.paragraph,
      }
}

function getTableStyle(node, colIndex) {
  return node.align[colIndex] == null
    ? {}
    : {
        textAlign: node.align[colIndex],
      }
}

/** TODO: remove for react 16 */
function normalizeAttributeKey(key) {
  const hyphenIndex = key.indexOf('-')

  if (hyphenIndex !== -1 && key.match(HTML_CUSTOM_ATTR_R) === null) {
    key = key.replace(CAPTURE_LETTER_AFTER_HYPHEN, function (_, letter) {
      return letter.toUpperCase()
    })
  }

  return key
}

type StyleTuple = [key: string, value: string]

function parseStyleAttribute(styleString: string): StyleTuple[] {
  const styles: StyleTuple[] = []
  let buffer = ''
  let inUrl = false
  let inQuotes = false
  let quoteChar: '"' | "'" | '' = ''

  if (!styleString) return styles

  for (let i = 0; i < styleString.length; i++) {
    const char = styleString[i]

    // Handle quotes
    if ((char === '"' || char === "'") && !inUrl) {
      if (!inQuotes) {
        inQuotes = true
        quoteChar = char
      } else if (char === quoteChar) {
        inQuotes = false
        quoteChar = ''
      }
    }

    // Track url() values
    if (char === '(' && buffer.endsWith('url')) {
      inUrl = true
    } else if (char === ')' && inUrl) {
      inUrl = false
    }

    // Only split on semicolons when not in quotes or url()
    if (char === ';' && !inQuotes && !inUrl) {
      const declaration = buffer.trim()
      if (declaration) {
        const colonIndex = declaration.indexOf(':')
        if (colonIndex > 0) {
          const key = declaration.slice(0, colonIndex).trim()
          const value = declaration.slice(colonIndex + 1).trim()
          styles.push([key, value])
        }
      }
      buffer = ''
    } else {
      buffer += char
    }
  }

  // Handle the last declaration
  const declaration = buffer.trim()
  if (declaration) {
    const colonIndex = declaration.indexOf(':')
    if (colonIndex > 0) {
      const key = declaration.slice(0, colonIndex).trim()
      const value = declaration.slice(colonIndex + 1).trim()
      styles.push([key, value])
    }
  }

  return styles
}

function attributeValueToJSXPropValue(
  tag: MarkdownToJSX.HTMLTags,
  key: string,
  value: string,
  sanitizeUrlFn: MarkdownToJSX.Options['sanitizer']
): any {
  if (key === 'style') {
    return parseStyleAttribute(value).reduce(function (styles, [key, value]) {
      // snake-case to camelCase
      // also handles PascalCasing vendor prefixes
      const camelCasedKey = key.replace(/(-[a-z])/g, substr =>
        substr[1].toUpperCase()
      )

      // key.length + 1 to skip over the colon
      styles[camelCasedKey] = sanitizeUrlFn(value, tag, key)

      return styles
    }, {})
  } else if (ATTRIBUTES_TO_SANITIZE.indexOf(key) !== -1) {
    return sanitizeUrlFn(unescape(value), tag, key)
  } else if (value.match(INTERPOLATION_R)) {
    // return as a string and let the consumer decide what to do with it
    value = unescape(value.slice(1, value.length - 1))
  }

  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  }

  return value
}

function normalizeWhitespace(source: string): string {
  return source
    .replace(CR_NEWLINE_R, '\n')
    .replace(FORMFEED_R, '')
    .replace(TAB_R, '    ')
}

/**
 * Creates a parser for a given set of rules, with the precedence
 * specified as a list of rules.
 *
 * @rules: an object containing
 * rule type -> {match, order, parse} objects
 * (lower order is higher precedence)
 * (Note: `order` is added to defaultRules after creation so that
 *  the `order` of defaultRules in the source matches the `order`
 *  of defaultRules in terms of `order` fields.)
 *
 * @returns The resulting parse function, with the following parameters:
 *   @source: the input source string to be parsed
 *   @state: an optional object to be threaded through parse
 *     calls. Allows clients to add stateful operations to
 *     parsing, such as keeping track of how many levels deep
 *     some nesting is. For an example use-case, see passage-ref
 *     parsing in src/widgets/passage/passage-markdown.jsx
 */
function parserFor(
  rules: MarkdownToJSX.Rules
): (
  source: string,
  state: MarkdownToJSX.State
) => ReturnType<MarkdownToJSX.NestedParser> {
  var ruleList = Object.keys(rules)

  if (process.env.NODE_ENV !== 'production') {
    ruleList.forEach(function (type) {
      const order = rules[type]._order
      if (typeof order !== 'number' || !isFinite(order)) {
        console.warn(
          'markdown-to-jsx: Invalid order for rule `' + type + '`: ' + order
        )
      }
    })
  }

  // Sorts rules in order of increasing order, then
  // ascending rule name in case of ties.
  ruleList.sort(function (a, b) {
    return rules[a]._order - rules[b]._order || (a < b ? -1 : 1)
  })

  function nestedParse(
    source: string,
    state: MarkdownToJSX.State
  ): MarkdownToJSX.ParserResult[] {
    var result = []
    state.prevCapture = state.prevCapture || ''

    if (source.trim()) {
      while (source) {
        var i = 0
        while (i < ruleList.length) {
          var ruleType = ruleList[i]
          var rule = rules[ruleType]

          if (rule._qualify && !qualifies(source, state, rule._qualify)) {
            i++
            continue
          }

          var capture = rule._match(source, state)
          if (capture && capture[0]) {
            source = source.substring(capture[0].length)

            var parsed = rule._parse(capture, nestedParse, state)

            state.prevCapture += capture[0]

            if (!parsed.type) parsed.type = ruleType as unknown as RuleType
            result.push(parsed)
            break
          }
          i++
        }
      }
    }

    // reset on exit
    state.prevCapture = ''

    return result
  }

  return function (source, state) {
    return nestedParse(normalizeWhitespace(source), state)
  }
}

/**
 * Marks a matcher function as eligible for being run inside an inline context;
 * allows us to do a little less work in the nested parser.
 */
function allowInline<T extends Function & { inline?: 0 | 1 }>(fn: T) {
  fn.inline = 1

  return fn
}

// Creates a match function for an inline scoped or simple element from a regex
function inlineRegex(regex: RegExp) {
  return allowInline(function match(source, state: MarkdownToJSX.State) {
    if (state.inline) {
      return regex.exec(source)
    } else {
      return null
    }
  })
}

// basically any inline element except links
function simpleInlineRegex(regex: RegExp) {
  return allowInline(function match(
    source: string,
    state: MarkdownToJSX.State
  ) {
    if (state.inline || state.simple) {
      return regex.exec(source)
    } else {
      return null
    }
  })
}

// Creates a match function for a block scoped element from a regex
function blockRegex(regex: RegExp) {
  return function match(source: string, state: MarkdownToJSX.State) {
    if (state.inline || state.simple) {
      return null
    } else {
      return regex.exec(source)
    }
  }
}

// Creates a match function from a regex, ignoring block/inline scope
function anyScopeRegex(regex: RegExp) {
  return allowInline(function match(source: string /*, state*/) {
    return regex.exec(source)
  })
}

const SANITIZE_R = /(javascript|vbscript|data(?!:image)):/i

export function sanitizer(input: string): string {
  try {
    const decoded = decodeURIComponent(input).replace(/[^A-Za-z0-9/:]/g, '')

    if (SANITIZE_R.test(decoded)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'Input contains an unsafe JavaScript/VBScript/data expression, it will not be rendered.',
          decoded
        )
      }

      return null
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Input could not be decoded due to malformed syntax or characters, it will not be rendered.',
        input
      )
    }

    // decodeURIComponent sometimes throws a URIError
    // See `decodeURIComponent('a%AFc');`
    // http://stackoverflow.com/questions/9064536/javascript-decodeuricomponent-malformed-uri-exception
    return null
  }

  return input
}

function unescape(rawString: string): string {
  return rawString ? rawString.replace(UNESCAPE_R, '$1') : rawString
}

/**
 * Everything inline, including links.
 */
function parseInline(
  parse: MarkdownToJSX.NestedParser,
  children: string,
  state: MarkdownToJSX.State
): MarkdownToJSX.ParserResult[] {
  const isCurrentlyInline = state.inline || false
  const isCurrentlySimple = state.simple || false
  state.inline = true
  state.simple = true
  const result = parse(children, state)
  state.inline = isCurrentlyInline
  state.simple = isCurrentlySimple
  return result
}

/**
 * Anything inline that isn't a link.
 */
function parseSimpleInline(
  parse: MarkdownToJSX.NestedParser,
  children: string,
  state: MarkdownToJSX.State
): MarkdownToJSX.ParserResult[] {
  const isCurrentlyInline = state.inline || false
  const isCurrentlySimple = state.simple || false
  state.inline = false
  state.simple = true
  const result = parse(children, state)
  state.inline = isCurrentlyInline
  state.simple = isCurrentlySimple
  return result
}

function parseBlock(
  parse,
  children,
  state: MarkdownToJSX.State
): MarkdownToJSX.ParserResult[] {
  const isCurrentlyInline = state.inline || false
  state.inline = false
  const result = parse(children, state)
  state.inline = isCurrentlyInline
  return result
}

const parseCaptureInline: MarkdownToJSX.Parser<{
  children: MarkdownToJSX.ParserResult[]
}> = (capture, parse, state: MarkdownToJSX.State) => {
  return {
    children: parseInline(parse, capture[2], state),
  }
}

function captureNothing() {
  return {}
}

function renderNothing() {
  return null
}

function createRenderer(
  rules: MarkdownToJSX.Rules,
  userRender?: MarkdownToJSX.Options['renderRule']
) {
  function renderRule(
    ast: MarkdownToJSX.ParserResult,
    render: MarkdownToJSX.RuleOutput,
    state: MarkdownToJSX.State
  ): ComponentChildren {
    const renderer = rules[ast.type]._render as MarkdownToJSX.Rule['_render']

    return userRender
      ? userRender(() => renderer(ast, render, state), ast, render, state)
      : renderer(ast, render, state)
  }

  return function patchedRender(
    ast: MarkdownToJSX.ParserResult | MarkdownToJSX.ParserResult[],
    state: MarkdownToJSX.State = {}
  ): ComponentChildren[] | ComponentChildren {
    if (Array.isArray(ast)) {
      const oldKey = state.key
      const result = []

      // map nestedOutput over the ast, except group any text
      // nodes together into a single string output.
      let lastWasString = false

      for (let i = 0; i < ast.length; i++) {
        state.key = i

        const nodeOut = patchedRender(ast[i], state)
        const _isString = isString(nodeOut)

        if (_isString && lastWasString) {
          result[result.length - 1] += nodeOut
        } else if (nodeOut !== null) {
          result.push(nodeOut)
        }

        lastWasString = _isString
      }

      state.key = oldKey

      return result
    }

    return renderRule(ast, patchedRender, state)
  }
}

function cx(...args) {
  return args.filter(Boolean).join(' ')
}

function get(src: Object, path: string, fb?: any) {
  let ptr = src
  const frags = path.split('.')

  while (frags.length) {
    ptr = ptr[frags[0]]

    if (ptr === undefined) break
    else frags.shift()
  }

  return ptr || fb
}

function getTag(tag: string, overrides: MarkdownToJSX.Overrides) {
  const override = get(overrides, tag)

  if (!override) return tag

  return typeof override === 'function' ||
    (typeof override === 'object' && 'render' in override)
    ? override
    : get(overrides, `${tag}.component`, tag)
}

export function compiler(
  markdown: string,
  options: MarkdownToJSX.Options & {
    wrapper: null
  }
): ComponentChildren[]
export function compiler(
  markdown: string,
  options?: MarkdownToJSX.Options
): JSX.Element
export function compiler(
  markdown: string = '',
  options: MarkdownToJSX.Options = {}
): JSX.Element | ComponentChildren[] {
  options.overrides = options.overrides || {}
  options.namedCodesToUnicode = options.namedCodesToUnicode
    ? { ...namedCodesToUnicode, ...options.namedCodesToUnicode }
    : namedCodesToUnicode

  const slug = options.slugify || slugify
  const sanitize = options.sanitizer || sanitizer
  const createElement = options.createElement
  if (!createElement) {
    throw new Error('markdown-to-jsx: the `createElement` option is required')
  }

  const NON_PARAGRAPH_BLOCK_SYNTAXES = [
    BLOCKQUOTE_R,
    CODE_BLOCK_FENCED_R,
    CODE_BLOCK_R,
    options.enforceAtxHeadings ? HEADING_ATX_COMPLIANT_R : HEADING_R,
    HEADING_SETEXT_R,
    NP_TABLE_R,
    ORDERED_LIST_R,
    UNORDERED_LIST_R,
  ]

  const BLOCK_SYNTAXES = [
    ...NON_PARAGRAPH_BLOCK_SYNTAXES,
    PARAGRAPH_R,
    HTML_BLOCK_ELEMENT_R,
    HTML_COMMENT_R,
    HTML_SELF_CLOSING_ELEMENT_R,
  ]

  function some(regexes: RegExp[], input: string) {
    for (let i = 0; i < regexes.length; i++) {
      if (regexes[i].test(input)) {
        return true
      }
    }
    return false
  }

  function containsBlockSyntax(input: string) {
    return some(BLOCK_SYNTAXES, input)
  }

  function matchParagraph(source: string, state: MarkdownToJSX.State) {
    if (
      state.inline ||
      state.simple ||
      (state.inHTML &&
        source.indexOf('\n\n') === -1 &&
        state.prevCapture.indexOf('\n\n') === -1)
    ) {
      return null
    }

    let match = ''
    let start = 0

    while (true) {
      const newlineIndex = source.indexOf('\n', start)

      // Extract the line including the newline
      const line = source.slice(
        start,
        newlineIndex === -1 ? undefined : newlineIndex + 1
      )
      if (some(NON_PARAGRAPH_BLOCK_SYNTAXES, line)) {
        break
      }

      match += line

      // Stop if line has no content (empty line)
      if (newlineIndex === -1 || !line.trim()) {
        break
      }

      start = newlineIndex + 1
    }

    const captured = trimEnd(match)
    if (captured === '') {
      return null
    }

    // parseCaptureInline expects the inner content to be at index 2
    // because index 1 is the delimiter for text formatting syntaxes
    return [match, , captured] as RegExpMatchArray
  }

  // JSX custom pragma
  // eslint-disable-next-line no-unused-vars
  function h(
    // locally we always will render a known string tag
    tag: MarkdownToJSX.HTMLTags,
    props: Parameters<MarkdownToJSX.CreateElement>[1] & {
      className?: string
      id?: string
    },
    ...children
  ) {
    const overrideProps = get(options.overrides, `${tag}.props`, {})

    return createElement(
      getTag(tag, options.overrides),
      {
        ...props,
        ...overrideProps,
        className: cx(props?.className, overrideProps.className) || undefined,
      },
      ...children
    )
  }

  function compile(input: string): JSX.Element | ComponentChildren[] {
    input = input.replace(FRONT_MATTER_R, '')

    let inline = false

    if (options.forceInline) {
      inline = true
    } else if (!options.forceBlock) {
      /**
       * should not contain any block-level markdown like newlines, lists, headings,
       * thematic breaks, blockquotes, tables, etc
       */
      inline = SHOULD_RENDER_AS_BLOCK_R.test(input) === false
    }

    const arr = emitter(
      parser(
        inline
          ? input
          : `${trimEnd(input).replace(TRIM_STARTING_NEWLINES, '')}\n\n`,
        {
          inline,
        }
      )
    ) as ComponentChildren[]

    while (
      isString(arr[arr.length - 1]) &&
      !(arr[arr.length - 1] as string).trim()
    ) {
      arr.pop()
    }

    if (options.wrapper === null) {
      return arr
    }

    const wrapper = options.wrapper || (inline ? 'span' : 'div')
    let jsx

    if (arr.length > 1 || options.forceWrapper) {
      jsx = arr
    } else if (arr.length === 1) {
      jsx = arr[0]

      // TODO: remove this for React 16
      if (typeof jsx === 'string') {
        return <span key="outer">{jsx}</span>
      } else {
        return jsx
      }
    } else {
      // TODO: return null for React 16
      jsx = null
    }

    return createElement(wrapper, { key: 'outer' }, jsx) as JSX.Element
  }

  function attrStringToMap(
    tag: MarkdownToJSX.HTMLTags,
    str: string
  ): Record<string, any> {
    if (!str || !str.trim()) {
      return null
    }

    const attributes = str.match(ATTR_EXTRACTOR_R)
    if (!attributes) {
      return null
    }

    return attributes.reduce(function (map, raw) {
      const delimiterIdx = raw.indexOf('=')

      if (delimiterIdx !== -1) {
        const key = normalizeAttributeKey(raw.slice(0, delimiterIdx)).trim()
        const value = unquote(raw.slice(delimiterIdx + 1).trim())

        const mappedKey = ATTRIBUTE_TO_JSX_PROP_MAP[key] || key

        // bail out, not supported
        if (mappedKey === 'ref') return map

        const normalizedValue = (map[mappedKey] = attributeValueToJSXPropValue(
          tag,
          key,
          value,
          sanitize
        ))

        if (
          typeof normalizedValue === 'string' &&
          (HTML_BLOCK_ELEMENT_R.test(normalizedValue) ||
            HTML_SELF_CLOSING_ELEMENT_R.test(normalizedValue))
        ) {
          map[mappedKey] = compile(normalizedValue.trim())
        }
      } else if (raw !== 'style') {
        map[ATTRIBUTE_TO_JSX_PROP_MAP[raw] || raw] = true
      }

      return map
    }, {})
  }

  if (process.env.NODE_ENV !== 'production') {
    if (typeof markdown !== 'string') {
      throw new Error(`markdown-to-jsx: the first argument must be
                             a string`)
    }

    if (
      Object.prototype.toString.call(options.overrides) !== '[object Object]'
    ) {
      throw new Error(`markdown-to-jsx: options.overrides (second argument property) must be
                             undefined or an object literal with shape:
                             {
                                htmltagname: {
                                    component: string|ReactComponent(optional),
                                    props: object(optional)
                                }
                             }`)
    }
  }

  const footnotes: { footnote: string; identifier: string }[] = []
  const refs: { [key: string]: { target: string; title: string } } = {}

  /**
   * each rule's react() output function goes through our custom
   * h() JSX pragma; this allows the override functionality to be
   * automatically applied
   */
  // @ts-ignore
  const rules: MarkdownToJSX.Rules = {
    [RuleType.blockQuote]: {
      _qualify: ['>'],
      _match: blockRegex(BLOCKQUOTE_R),
      _order: Priority.HIGH,
      _parse(capture, parse, state) {
        const [, alert, content] = capture[0]
          .replace(BLOCKQUOTE_TRIM_LEFT_MULTILINE_R, '')
          .match(BLOCKQUOTE_ALERT_R)

        return {
          alert,
          children: parse(content, state),
        }
      },
      _render(node, output, state) {
        const props = {
          key: state.key,
        } as Record<string, unknown>

        if (node.alert) {
          props.className =
            'markdown-alert-' + slug(node.alert.toLowerCase(), slugify)

          node.children.unshift({
            attrs: {},
            children: [{ type: RuleType.text, text: node.alert }],
            noInnerParse: true,
            type: RuleType.htmlBlock,
            tag: 'header',
          })
        }

        return h('blockquote', props, output(node.children, state))
      },
    },

    [RuleType.breakLine]: {
      _qualify: ['  '],
      _match: anyScopeRegex(BREAK_LINE_R),
      _order: Priority.HIGH,
      _parse: captureNothing,
      _render(_, __, state) {
        return <br key={state.key} />
      },
    },

    [RuleType.breakThematic]: {
      _qualify: ['--', '__', '**', '- ', '* ', '_ '],
      _match: blockRegex(BREAK_THEMATIC_R),
      _order: Priority.HIGH,
      _parse: captureNothing,
      _render(_, __, state) {
        return <hr key={state.key} />
      },
    },

    [RuleType.codeBlock]: {
      _qualify: ['    '],
      _match: blockRegex(CODE_BLOCK_R),
      _order: Priority.MAX,
      _parse(capture /*, parse, state*/) {
        return {
          lang: undefined,
          text: unescape(trimEnd(capture[0].replace(/^ {4}/gm, ''))),
        }
      },

      _render(node, output, state) {
        return (
          <pre key={state.key}>
            <code
              {...node.attrs}
              className={node.lang ? `lang-${node.lang}` : ''}
            >
              {node.text}
            </code>
          </pre>
        )
      },
    } as MarkdownToJSX.Rule<{
      attrs?: ReturnType<typeof attrStringToMap>
      lang?: string
      text: string
    }>,

    [RuleType.codeFenced]: {
      _qualify: ['```', '~~~'],
      _match: blockRegex(CODE_BLOCK_FENCED_R),
      _order: Priority.MAX,
      _parse(capture /*, parse, state*/) {
        return {
          // if capture[3] it's additional metadata
          attrs: attrStringToMap('code', capture[3] || ''),
          lang: capture[2] || undefined,
          text: capture[4],
          type: RuleType.codeBlock,
        }
      },
    },

    [RuleType.codeInline]: {
      _qualify: ['`'],
      _match: simpleInlineRegex(CODE_INLINE_R),
      _order: Priority.LOW,
      _parse(capture /*, parse, state*/) {
        return {
          text: unescape(capture[2]),
        }
      },
      _render(node, output, state) {
        return <code key={state.key}>{node.text}</code>
      },
    },

    /**
     * footnotes are emitted at the end of compilation in a special <footer> block
     */
    [RuleType.footnote]: {
      _qualify: ['[^'],
      _match: blockRegex(FOOTNOTE_R),
      _order: Priority.MAX,
      _parse(capture /*, parse, state*/) {
        footnotes.push({
          footnote: capture[2],
          identifier: capture[1],
        })

        return {}
      },
      _render: renderNothing,
    },

    [RuleType.footnoteReference]: {
      _qualify: ['[^'],
      _match: inlineRegex(FOOTNOTE_REFERENCE_R),
      _order: Priority.HIGH,
      _parse(capture /*, parse*/) {
        return {
          target: `#${slug(capture[1], slugify)}`,
          text: capture[1],
        }
      },
      _render(node, output, state) {
        return (
          <a key={state.key} href={sanitize(node.target, 'a', 'href')}>
            <sup key={state.key}>{node.text}</sup>
          </a>
        )
      },
    } as MarkdownToJSX.Rule<{ target: string; text: string }>,

    [RuleType.gfmTask]: {
      _qualify: ['[ ]', '[x]'],
      _match: inlineRegex(GFM_TASK_R),
      _order: Priority.HIGH,
      _parse(capture /*, parse, state*/) {
        return {
          completed: capture[1].toLowerCase() === 'x',
        }
      },
      _render(node, output, state) {
        return (
          <input
            checked={node.completed}
            key={state.key}
            readOnly
            type="checkbox"
          />
        )
      },
    } as MarkdownToJSX.Rule<{ completed: boolean }>,

    [RuleType.heading]: {
      _qualify: ['#'],
      _match: blockRegex(
        options.enforceAtxHeadings ? HEADING_ATX_COMPLIANT_R : HEADING_R
      ),
      _order: Priority.HIGH,
      _parse(capture, parse, state) {
        return {
          children: parseInline(parse, capture[2], state),
          id: slug(capture[2], slugify),
          level: capture[1].length as MarkdownToJSX.HeadingNode['level'],
        }
      },
      _render(node, output, state) {
        return h(
          `h${node.level}`,
          { id: node.id, key: state.key },
          output(node.children, state)
        )
      },
    },

    [RuleType.headingSetext]: {
      _qualify: source => {
        const nlIndex = source.indexOf('\n')
        return (
          nlIndex > 0 &&
          nlIndex < source.length - 1 &&
          (source[nlIndex + 1] === '=' || source[nlIndex + 1] === '-')
        )
      },
      _match: blockRegex(HEADING_SETEXT_R),
      _order: Priority.MAX,
      _parse(capture, parse, state) {
        return {
          children: parseInline(parse, capture[1], state),
          level: capture[2] === '=' ? 1 : 2,
          type: RuleType.heading,
        }
      },
    },

    [RuleType.htmlBlock]: {
      _qualify: ['<'],
      /**
       * find the first matching end tag and process the interior
       */
      _match: anyScopeRegex(HTML_BLOCK_ELEMENT_R),
      _order: Priority.HIGH,
      _parse(capture, parse, state) {
        const [, whitespace] = capture[3].match(HTML_LEFT_TRIM_AMOUNT_R)

        const trimmer = new RegExp(`^${whitespace}`, 'gm')
        const trimmed = capture[3].replace(trimmer, '')

        const parseFunc = containsBlockSyntax(trimmed)
          ? parseBlock
          : parseInline

        const tagName = capture[1].toLowerCase() as MarkdownToJSX.HTMLTags
        const noInnerParse =
          DO_NOT_PROCESS_HTML_ELEMENTS.indexOf(tagName) !== -1

        const tag = (
          noInnerParse ? tagName : capture[1]
        ).trim() as MarkdownToJSX.HTMLTags

        const ast = {
          attrs: attrStringToMap(tag, capture[2]),
          noInnerParse: noInnerParse,
          tag,
        } as {
          attrs: ReturnType<typeof attrStringToMap>
          children?: ReturnType<MarkdownToJSX.NestedParser> | undefined
          noInnerParse: Boolean
          tag: MarkdownToJSX.HTMLTags
          text?: string | undefined
        }

        state.inAnchor = state.inAnchor || tagName === 'a'

        if (noInnerParse) {
          ast.text = capture[3]
        } else {
          const prevInHTML = state.inHTML
          state.inHTML = true
          ast.children = parseFunc(parse, trimmed, state)
          state.inHTML = prevInHTML
        }

        /**
         * if another html block is detected within, parse as block,
         * otherwise parse as inline to pick up any further markdown
         */
        state.inAnchor = false

        return ast
      },
      _render(node, output, state) {
        return (
          <node.tag key={state.key} {...node.attrs}>
            {node.text || (node.children ? output(node.children, state) : '')}
          </node.tag>
        )
      },
    },

    [RuleType.htmlSelfClosing]: {
      _qualify: ['<'],
      /**
       * find the first matching end tag and process the interior
       */
      _match: anyScopeRegex(HTML_SELF_CLOSING_ELEMENT_R),
      _order: Priority.HIGH,
      _parse(capture /*, parse, state*/) {
        const tag = capture[1].trim() as MarkdownToJSX.HTMLTags
        return {
          attrs: attrStringToMap(tag, capture[2] || ''),
          tag,
        }
      },
      _render(node, output, state) {
        return <node.tag {...node.attrs} key={state.key} />
      },
    },

    [RuleType.htmlComment]: {
      _qualify: ['<!--'],
      _match: anyScopeRegex(HTML_COMMENT_R),
      _order: Priority.HIGH,
      _parse() {
        return {}
      },
      _render: renderNothing,
    },

    [RuleType.image]: {
      _qualify: ['!['],
      _match: simpleInlineRegex(IMAGE_R),
      _order: Priority.HIGH,
      _parse(capture /*, parse, state*/) {
        return {
          alt: unescape(capture[1]),
          target: unescape(capture[2]),
          title: unescape(capture[3]),
        }
      },
      _render(node, output, state) {
        return (
          <img
            key={state.key}
            alt={node.alt || undefined}
            title={node.title || undefined}
            src={sanitize(node.target, 'img', 'src')}
          />
        )
      },
    } as MarkdownToJSX.Rule<{
      alt?: string
      target: string
      title?: string
    }>,

    [RuleType.link]: {
      _qualify: ['['],
      _match: inlineRegex(LINK_R),
      _order: Priority.LOW,
      _parse(capture, parse, state) {
        return {
          children: parseSimpleInline(parse, capture[1], state),
          target: unescape(capture[2]),
          title: unescape(capture[3]),
        }
      },
      _render(node, output, state) {
        return (
          <a
            key={state.key}
            href={sanitize(node.target, 'a', 'href')}
            title={node.title}
          >
            {output(node.children, state)}
          </a>
        )
      },
    },

    // https://daringfireball.net/projects/markdown/syntax#autolink
    [RuleType.linkAngleBraceStyleDetector]: {
      _qualify: ['<'],
      _match: inlineRegex(LINK_AUTOLINK_R),
      _order: Priority.MAX,
      _parse(capture /*, parse, state*/) {
        let target = capture[1]
        let isEmail = false

        if (
          target.indexOf('@') !== -1 &&
          // emails don't have protocols in them
          target.indexOf('//') === -1
        ) {
          isEmail = true
          target = target.replace('mailto:', '')
        }

        return {
          children: [
            {
              text: target,
              type: RuleType.text,
            },
          ],
          target: isEmail ? 'mailto:' + target : target,
          type: RuleType.link,
        }
      },
    },

    [RuleType.linkBareUrlDetector]: {
      _qualify: (source, state) => {
        if (state.inAnchor || options.disableAutoLink) return false
        return startsWith(source, 'http://') || startsWith(source, 'https://')
      },
      _match: inlineRegex(LINK_AUTOLINK_BARE_URL_R),
      _order: Priority.MAX,
      _parse(capture /*, parse, state*/) {
        return {
          children: [
            {
              text: capture[1],
              type: RuleType.text,
            },
          ],
          target: capture[1],
          title: undefined,
          type: RuleType.link,
        }
      },
    },

    [RuleType.orderedList]: generateListRule(
      h,
      ORDERED
    ) as MarkdownToJSX.Rule<MarkdownToJSX.OrderedListNode>,

    [RuleType.unorderedList]: generateListRule(
      h,
      UNORDERED
    ) as MarkdownToJSX.Rule<MarkdownToJSX.UnorderedListNode>,

    [RuleType.newlineCoalescer]: {
      _qualify: ['\n'],
      _match: blockRegex(CONSECUTIVE_NEWLINE_R),
      _order: Priority.LOW,
      _parse: captureNothing,
      _render(/*node, output, state*/) {
        return '\n'
      },
    },

    [RuleType.paragraph]: {
      _match: allowInline(matchParagraph),
      _order: Priority.LOW,
      _parse: parseCaptureInline,
      _render(node, output, state) {
        return <p key={state.key}>{output(node.children, state)}</p>
      },
    } as MarkdownToJSX.Rule<ReturnType<typeof parseCaptureInline>>,

    [RuleType.ref]: {
      _qualify: ['['],
      _match: inlineRegex(REFERENCE_IMAGE_OR_LINK),
      _order: Priority.MAX,
      _parse(capture /*, parse*/) {
        refs[capture[1]] = {
          target: capture[2],
          title: capture[4],
        }

        return {}
      },
      _render: renderNothing,
    },

    [RuleType.refImage]: {
      _qualify: ['!['],
      _match: simpleInlineRegex(REFERENCE_IMAGE_R),
      _order: Priority.MAX,
      _parse(capture) {
        return {
          alt: capture[1] ? unescape(capture[1]) : undefined,
          ref: capture[2],
        }
      },
      _render(node, output, state) {
        return refs[node.ref] ? (
          <img
            key={state.key}
            alt={node.alt}
            src={sanitize(refs[node.ref].target, 'img', 'src')}
            title={refs[node.ref].title}
          />
        ) : null
      },
    } as MarkdownToJSX.Rule<{ alt?: string; ref: string }>,

    [RuleType.refLink]: {
      _qualify: source => source[0] === '[' && source.indexOf('](') === -1,
      _match: inlineRegex(REFERENCE_LINK_R),
      _order: Priority.MAX,
      _parse(capture, parse, state) {
        return {
          children: parse(capture[1], state),
          fallbackChildren: capture[0],
          ref: capture[2],
        }
      },
      _render(node, output, state) {
        return refs[node.ref] ? (
          <a
            key={state.key}
            href={sanitize(refs[node.ref].target, 'a', 'href')}
            title={refs[node.ref].title}
          >
            {output(node.children, state)}
          </a>
        ) : (
          <span key={state.key}>{node.fallbackChildren}</span>
        )
      },
    },

    [RuleType.table]: {
      _qualify: ['|'],
      _match: blockRegex(NP_TABLE_R),
      _order: Priority.HIGH,
      _parse: parseTable,
      _render(node, output, state) {
        const table = node as MarkdownToJSX.TableNode
        return (
          <table key={state.key}>
            <thead>
              <tr>
                {table.header.map(function generateHeaderCell(content, i) {
                  return (
                    <th key={i} style={getTableStyle(table, i)}>
                      {output(content, state)}
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {table.cells.map(function generateTableRow(row, i) {
                return (
                  <tr key={i}>
                    {row.map(function generateTableCell(content, c) {
                      return (
                        <td key={c} style={getTableStyle(table, c)}>
                          {output(content, state)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
      },
    },

    [RuleType.text]: {
      // Here we look for anything followed by non-symbols,
      // double newlines, or double-space-newlines
      // We break on any symbol characters so that this grammar
      // is easy to extend without needing to modify this regex
      _match: allowInline(function (source, state) {
        let ret
        if (startsWith(source, ':')) ret = SHORTCODE_R.exec(source)
        if (ret) return ret

        return TEXT_PLAIN_R.exec(source)
      }),
      _order: Priority.MIN,
      _parse(capture) {
        const text = capture[0]
        return {
          text:
            text.indexOf('&') === -1
              ? text
              : text.replace(
                  HTML_CHAR_CODE_R,
                  (full, inner) => options.namedCodesToUnicode[inner] || full
                ),
        }
      },
      _render(node) {
        return node.text
      },
    },

    [RuleType.textBolded]: {
      _qualify: ['**', '__'],
      _match: simpleInlineRegex(TEXT_BOLD_R),
      _order: Priority.MED,
      _parse(capture, parse, state) {
        return {
          // capture[1] -> the syntax control character
          // capture[2] -> inner content
          children: parse(capture[2], state),
        }
      },
      _render(node, output, state) {
        return <strong key={state.key}>{output(node.children, state)}</strong>
      },
    },

    [RuleType.textEmphasized]: {
      _qualify: source => {
        const char = source[0]
        return (char === '*' || char === '_') && source[1] !== char
      },
      _match: simpleInlineRegex(TEXT_EMPHASIZED_R),
      _order: Priority.LOW,
      _parse(capture, parse, state) {
        return {
          // capture[1] -> opening * or _
          // capture[2] -> inner content
          children: parse(capture[2], state),
        }
      },
      _render(node, output, state) {
        return <em key={state.key}>{output(node.children, state)}</em>
      },
    },

    [RuleType.textEscaped]: {
      _qualify: ['\\'],
      // We don't allow escaping numbers, letters, or spaces here so that
      // backslashes used in plain text still get rendered. But allowing
      // escaping anything else provides a very flexible escape mechanism,
      // regardless of how this grammar is extended.
      _match: simpleInlineRegex(TEXT_ESCAPED_R),
      _order: Priority.HIGH,
      _parse(capture /*, parse, state*/) {
        return {
          text: capture[1],
          type: RuleType.text,
        }
      },
    },

    [RuleType.textMarked]: {
      _qualify: ['=='],
      _match: simpleInlineRegex(TEXT_MARKED_R),
      _order: Priority.LOW,
      _parse: parseCaptureInline,
      _render(node, output, state) {
        return <mark key={state.key}>{output(node.children, state)}</mark>
      },
    },

    [RuleType.textStrikethroughed]: {
      _qualify: ['~~'],
      _match: simpleInlineRegex(TEXT_STRIKETHROUGHED_R),
      _order: Priority.LOW,
      _parse: parseCaptureInline,
      _render(node, output, state) {
        return <del key={state.key}>{output(node.children, state)}</del>
      },
    },
  }

  if (options.disableParsingRawHTML === true) {
    delete rules[RuleType.htmlBlock]
    delete rules[RuleType.htmlSelfClosing]
  }

  const parser = parserFor(rules)
  const emitter = createRenderer(rules, options.renderRule)

  const jsx = compile(markdown)

  if (footnotes.length) {
    return (
      <div>
        {jsx}
        <footer key="footer">
          {footnotes.map(function createFootnote(def) {
            return (
              <div id={slug(def.identifier, slugify)} key={def.identifier}>
                {def.identifier}
                {emitter(parser(def.footnote, { inline: true }))}
              </div>
            )
          })}
        </footer>
      </div>
    )
  }

  return jsx
}

export namespace MarkdownToJSX {
  /**
   * RequireAtLeastOne<{ ... }> <- only requires at least one key
   */
  type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
    T,
    Exclude<keyof T, Keys>
  > &
    {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys]

  export type CreateElement = Pragma

  export type HTMLTags = string

  export type State = {
    /** true if the current content is inside anchor link grammar */
    inAnchor?: boolean
    /** true if parsing in an HTML context */
    inHTML?: boolean
    /** true if parsing in an inline context (subset of rules around formatting and links) */
    inline?: boolean
    /** true if in a table */
    inTable?: boolean
    /** use this for the `key` prop */
    key?: string | number
    /** true if in a list */
    list?: boolean
    /** used for lookbacks */
    prevCapture?: string
    /** true if parsing in inline context w/o links */
    simple?: boolean
  }

  export interface BlockQuoteNode {
    alert?: string
    children: MarkdownToJSX.ParserResult[]
    type: typeof RuleType.blockQuote
  }

  export interface BreakLineNode {
    type: typeof RuleType.breakLine
  }

  export interface BreakThematicNode {
    type: typeof RuleType.breakThematic
  }

  export interface CodeBlockNode {
    type: typeof RuleType.codeBlock
    attrs?: Record<string, any>
    lang?: string
    text: string
  }

  export interface CodeFencedNode {
    type: typeof RuleType.codeFenced
  }

  export interface CodeInlineNode {
    type: typeof RuleType.codeInline
    text: string
  }

  export interface FootnoteNode {
    type: typeof RuleType.footnote
  }

  export interface FootnoteReferenceNode {
    type: typeof RuleType.footnoteReference
    target: string
    text: string
  }

  export interface GFMTaskNode {
    type: typeof RuleType.gfmTask
    completed: boolean
  }

  export interface HeadingNode {
    type: typeof RuleType.heading
    children: MarkdownToJSX.ParserResult[]
    id: string
    level: 1 | 2 | 3 | 4 | 5 | 6
  }

  export interface HeadingSetextNode {
    type: typeof RuleType.headingSetext
  }

  export interface HTMLCommentNode {
    type: typeof RuleType.htmlComment
  }

  export interface ImageNode {
    type: typeof RuleType.image
    alt?: string
    target: string
    title?: string
  }

  export interface LinkNode {
    type: typeof RuleType.link
    children: MarkdownToJSX.ParserResult[]
    target: string
    title?: string
  }

  export interface LinkAngleBraceNode {
    type: typeof RuleType.linkAngleBraceStyleDetector
  }

  export interface LinkBareURLNode {
    type: typeof RuleType.linkBareUrlDetector
  }

  export interface LinkMailtoNode {
    type: typeof RuleType.linkMailtoDetector
  }

  export interface OrderedListNode {
    type: typeof RuleType.orderedList
    items: MarkdownToJSX.ParserResult[][]
    ordered: true
    start?: number
  }

  export interface UnorderedListNode {
    type: typeof RuleType.unorderedList
    items: MarkdownToJSX.ParserResult[][]
    ordered: false
  }

  export interface NewlineNode {
    type: typeof RuleType.newlineCoalescer
  }

  export interface ParagraphNode {
    type: typeof RuleType.paragraph
    children: MarkdownToJSX.ParserResult[]
  }

  export interface ReferenceNode {
    type: typeof RuleType.ref
  }

  export interface ReferenceImageNode {
    type: typeof RuleType.refImage
    alt?: string
    ref: string
  }

  export interface ReferenceLinkNode {
    type: typeof RuleType.refLink
    children: MarkdownToJSX.ParserResult[]
    fallbackChildren: string
    ref: string
  }

  export interface TableNode {
    type: typeof RuleType.table
    /**
     * alignment for each table column
     */
    align: ('left' | 'right' | 'center')[]
    cells: MarkdownToJSX.ParserResult[][][]
    header: MarkdownToJSX.ParserResult[][]
  }

  export interface TableSeparatorNode {
    type: typeof RuleType.tableSeparator
  }

  export interface TextNode {
    type: typeof RuleType.text
    text: string
  }

  export interface BoldTextNode {
    type: typeof RuleType.textBolded
    children: MarkdownToJSX.ParserResult[]
  }

  export interface ItalicTextNode {
    type: typeof RuleType.textEmphasized
    children: MarkdownToJSX.ParserResult[]
  }

  export interface EscapedTextNode {
    type: typeof RuleType.textEscaped
  }

  export interface MarkedTextNode {
    type: typeof RuleType.textMarked
    children: MarkdownToJSX.ParserResult[]
  }

  export interface StrikethroughTextNode {
    type: typeof RuleType.textStrikethroughed
    children: MarkdownToJSX.ParserResult[]
  }

  export interface HTMLNode {
    type: typeof RuleType.htmlBlock
    attrs: Record<string, any>
    children?: ReturnType<MarkdownToJSX.NestedParser> | undefined
    noInnerParse: Boolean
    tag: MarkdownToJSX.HTMLTags
    text?: string | undefined
  }

  export interface HTMLSelfClosingNode {
    type: typeof RuleType.htmlSelfClosing
    attrs: Record<string, any>
    tag: string
  }

  export type ParserResult =
    | BlockQuoteNode
    | BreakLineNode
    | BreakThematicNode
    | CodeBlockNode
    | CodeFencedNode
    | CodeInlineNode
    | FootnoteNode
    | FootnoteReferenceNode
    | GFMTaskNode
    | HeadingNode
    | HeadingSetextNode
    | HTMLCommentNode
    | ImageNode
    | LinkNode
    | LinkAngleBraceNode
    | LinkBareURLNode
    | LinkMailtoNode
    | OrderedListNode
    | UnorderedListNode
    | NewlineNode
    | ParagraphNode
    | ReferenceNode
    | ReferenceImageNode
    | ReferenceLinkNode
    | TableNode
    | TableSeparatorNode
    | TextNode
    | BoldTextNode
    | ItalicTextNode
    | EscapedTextNode
    | MarkedTextNode
    | StrikethroughTextNode
    | HTMLNode
    | HTMLSelfClosingNode

  export type NestedParser = (
    input: string,
    state?: MarkdownToJSX.State
  ) => MarkdownToJSX.ParserResult[]

  export type Parser<ParserOutput> = (
    capture: RegExpMatchArray,
    nestedParse: NestedParser,
    state?: MarkdownToJSX.State
  ) => ParserOutput

  export type RuleOutput = (
    ast: MarkdownToJSX.ParserResult | MarkdownToJSX.ParserResult[],
    state: MarkdownToJSX.State
  ) => ComponentChildren

  export type Rule<ParserOutput = MarkdownToJSX.ParserResult> = {
    _match: (
      source: string,
      state: MarkdownToJSX.State,
      prevCapturedString?: string
    ) => RegExpMatchArray
    _order: (typeof Priority)[keyof typeof Priority]
    _parse: MarkdownToJSX.Parser<Omit<ParserOutput, 'type'>>
    /**
     * Optional fast check that can quickly determine if this rule
     * should even be attempted. Should check the start of the source string
     * for quick patterns without expensive regex operations.
     *
     * @param source The input source string (already trimmed of leading whitespace)
     * @param state Current parser state
     * @returns true if the rule should be attempted, false to skip
     */
    _qualify?:
      | string[]
      | ((source: string, state: MarkdownToJSX.State) => boolean)
    _render?: (
      node: ParserOutput,
      /**
       * Continue rendering AST nodes if applicable.
       */
      render: RuleOutput,
      state?: MarkdownToJSX.State
    ) => ComponentChildren
  }

  export type Rules = {
    [K in ParserResult['type']]: K extends typeof RuleType.table
      ? Rule<Extract<ParserResult, { type: K | typeof RuleType.paragraph }>>
      : Rule<Extract<ParserResult, { type: K }>>
  }

  export type Override =
    | RequireAtLeastOne<{
        component: ElementType
        props: Object
      }>
    | ElementType

  export type Overrides = {
    [tag in HTMLTags]?: Override
  } & {
    [customComponent: string]: Override
  }

  export type Options = Partial<{
    /**
     * Ultimate control over the output of all rendered JSX.
     */
    createElement: (
      tag: Parameters<CreateElement>[0],
      props: Record<string, any>,
      ...children: ComponentChildren[]
    ) => ComponentChildren

    /**
     * The library automatically generates an anchor tag for bare URLs included in the markdown
     * document, but this behavior can be disabled if desired.
     */
    disableAutoLink: boolean

    /**
     * Disable the compiler's best-effort transcription of provided raw HTML
     * into JSX-equivalent. This is the functionality that prevents the need to
     * use `dangerouslySetInnerHTML` in React.
     */
    disableParsingRawHTML: boolean

    /**
     * Forces the compiler to have space between hash sign and the header text which
     * is explicitly stated in the most of the markdown specs.
     * https://github.github.com/gfm/#atx-heading
     * `The opening sequence of # characters must be followed by a space or by the end of line.`
     */
    enforceAtxHeadings: boolean

    /**
     * Forces the compiler to always output content with a block-level wrapper
     * (`<p>` or any block-level syntax your markdown already contains.)
     */
    forceBlock: boolean

    /**
     * Forces the compiler to always output content with an inline wrapper (`<span>`)
     */
    forceInline: boolean

    /**
     * Forces the compiler to wrap results, even if there is only a single
     * child or no children.
     */
    forceWrapper: boolean

    /**
     * Supply additional HTML entity: unicode replacement mappings.
     *
     * Pass only the inner part of the entity as the key,
     * e.g. `&le;` -> `{ "le": "\u2264" }`
     *
     * By default
     * the following entities are replaced with their unicode equivalents:
     *
     * ```
     * &amp;
     * &apos;
     * &gt;
     * &lt;
     * &nbsp;
     * &quot;
     * ```
     */
    namedCodesToUnicode: {
      [key: string]: string
    }

    /**
     * Selectively control the output of particular HTML tags as they would be
     * emitted by the compiler.
     */
    overrides: Overrides

    /**
     * Allows for full control over rendering of particular rules.
     * For example, to implement a LaTeX renderer such as `react-katex`:
     *
     * ```
     * renderRule(next, node, renderChildren, state) {
     *   if (node.type === RuleType.codeBlock && node.lang === 'latex') {
     *     return (
     *       <TeX as="div" key={state.key}>
     *         {String.raw`${node.text}`}
     *       </TeX>
     *     )
     *   }
     *
     *   return next();
     * }
     * ```
     *
     * Thar be dragons obviously, but you can do a lot with this
     * (have fun!) To see how things work internally, check the `render`
     * method in source for a particular rule.
     */
    renderRule: (
      /** Resume normal processing, call this function as a fallback if you are not returning custom JSX. */
      next: () => ComponentChildren,
      /** the current AST node, use `RuleType` against `node.type` for identification */
      node: ParserResult,
      /** use as `renderChildren(node.children)` for block nodes */
      renderChildren: RuleOutput,
      /** contains `key` which should be supplied to the topmost JSX element */
      state: State
    ) => ComponentChildren

    /**
     * Override the built-in sanitizer function for URLs, etc if desired. The built-in version is available as a library export called `sanitizer`.
     */
    sanitizer: (
      value: string,
      tag: HTMLTags,
      attribute: string
    ) => string | null

    /**
     * Override normalization of non-URI-safe characters for use in generating
     * HTML IDs for anchor linking purposes.
     */
    slugify: (input: string, defaultFn: (input: string) => string) => string

    /**
     * Declare the type of the wrapper to be used when there are multiple
     * children to render. Set to `null` to get an array of children back
     * without any wrapper, or use `React.Fragment` to get a React element
     * that won't show up in the DOM.
     */
    wrapper: ElementType | null
  }>
}
