const CODE_FENCE_R = /^ {0,3}(?:```|~~~)/gm;
const CODE_SPAN_R = /`[^`]*`/g;
const UNFINISHED_LINK_R = /^(!?)\[([^\]]*)(?:\]\([^)]*|\]?)$/;
// Preceded by whitespace, it can only open a marker, not close one.
const MARKER_START_R = /(^|\s)[*_~]$/;

function countOccurrences(text: string, marker: string) {
  return text.split(marker).length - 1;
}

function stripUnfinishedLink(line: string) {
  // Matching from a single bracket keeps this linear in the line length.
  const url = line.lastIndexOf('](');
  const end = url !== -1 && line.indexOf(')', url) === -1 ? url : line.length;
  const bracket = line.lastIndexOf('[', end);

  if (bracket === -1) {
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

function closeMarker(line: string, marker: string) {
  // Markers inside inline code are literal text. Inline code is closed first,
  // so every backtick left here belongs to a complete span.
  if (countOccurrences(line.replace(CODE_SPAN_R, ''), marker) % 2 === 0) {
    return line;
  }

  let end = line.length;
  while (end > 0 && line[end - 1] <= ' ') end--;
  const content = line.slice(0, end);
  const trailing = line.slice(end);

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

  return (
    text.slice(0, lineStart) +
    ['`', '**', '__', '~~']
      .reduce(closeMarker, stripUnfinishedLink(text.slice(lineStart)))
      .replace(MARKER_START_R, '$1')
  );
}
