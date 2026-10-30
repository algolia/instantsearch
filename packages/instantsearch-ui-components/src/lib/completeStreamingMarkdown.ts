const CODE_FENCE_R = /^ {0,3}(?:```|~~~)/gm;
const CODE_SPAN_R = /`[^`]*`/g;
const UNFINISHED_LINK_R = /^(!?)\[([^\]]*)(?:\]\([^)]*|\]?)$/;
// Preceded by whitespace, it can only open a marker, not close one.
const MARKER_START_R = /(^|\s)[*_~]$/;
// A blank line, or a line that may start a list item, quote or heading.
const BLOCK_START_R = /\n(?:[ \t]*\n|(?=[ \t]*(?:[-*+>#]|\d+[.)])))/g;

function countOccurrences(text: string, marker: string) {
  return text.split(marker).length - 1;
}

function stripUnfinishedLink(line: string) {
  // Matching from a single bracket keeps this linear in the line length.
  const url = line.lastIndexOf('](');
  const end = url !== -1 && line.indexOf(')', url) === -1 ? url : line.length;
  const bracket = line.lastIndexOf('[', end);

  // A bracket inside inline code is literal text.
  if (bracket === -1 || countOccurrences(line.slice(0, bracket), '`') % 2) {
    return line;
  }

  const start = line[bracket - 1] === '!' ? bracket - 1 : bracket;

  // An image with a partial URL would request it, so it's left out entirely.
  return (
    line.slice(0, start) +
    line
      .slice(start)
      .replace(UNFINISHED_LINK_R, (_, image: string, label: string) =>
        image ? '' : label
      )
  );
}

function closeMarker(block: string, marker: string) {
  let end = block.length;
  while (end > 0 && block[end - 1] <= ' ') end--;
  const content = block.slice(0, end);
  const trailing = block.slice(end);

  if (content.slice(-marker.length) === marker) {
    return content.slice(0, -marker.length) + trailing;
  }

  // A partly received closing marker, like the first `*` of `**`.
  const received = marker.slice(0, -1);
  const missing =
    received && content.slice(-received.length) === received
      ? marker.slice(received.length)
      : marker;

  return content + missing + trailing;
}

function closeMarkers(block: string) {
  const code =
    countOccurrences(block, '`') % 2 ? closeMarker(block, '`') : block;
  // Inline code is closed, so markers left outside the code spans are prose.
  const prose = code.replace(CODE_SPAN_R, '');

  return (
    ['**', '__', '~~']
      .filter((marker) => countOccurrences(prose, marker) % 2)
      // The last opened marker is nested in the others, so it closes first.
      .sort((a, b) => prose.lastIndexOf(b) - prose.lastIndexOf(a))
      .reduce(closeMarker, code)
  );
}

// Where the last paragraph, list item or quote starts: earlier blocks are
// finished, but a span in this one can be open since a previous line.
function blockStart(text: string) {
  let start = 0;
  BLOCK_START_R.lastIndex = 0;
  for (let match; (match = BLOCK_START_R.exec(text)); ) {
    start = match.index + match[0].length;
  }
  return start;
}

/**
 * Rewrites the end of a markdown text that is still streaming so the parser
 * doesn't show half-written syntax, such as a link to a cut-off URL.
 */
export function completeStreamingMarkdown(text: string): string {
  // Inside an unfinished code block, everything is literal text.
  if ((text.match(CODE_FENCE_R) || []).length % 2 === 1) {
    return text;
  }

  const lineStart = text.lastIndexOf('\n') + 1;
  const linked =
    text.slice(0, lineStart) + stripUnfinishedLink(text.slice(lineStart));
  const start = blockStart(linked);

  return (
    linked.slice(0, start) +
    closeMarkers(linked.slice(start)).replace(MARKER_START_R, '$1')
  );
}
