/* eslint-disable no-control-regex */
// Based on https://github.com/mrazauskas/jest-serializer-ansi-escapes (MIT License)
const escape = '\u001b';

const colorText = new Map([
  ['0', '/'],

  ['1', 'bold'],
  ['2', 'dim'],
  ['3', 'italic'],
  ['4', 'underline'],

  ['7', 'inverse'],
  ['8', 'hidden'],
  ['9', 'strikethrough'],

  ['22', '/intensity'],
  ['23', '/italic'],
  ['24', '/underline'],

  ['27', '/inverse'],
  ['28', '/hidden'],
  ['29', '/strikethrough'],

  ['30', 'black'],
  ['31', 'red'],
  ['32', 'green'],
  ['33', 'yellow'],
  ['34', 'blue'],
  ['35', 'magenta'],
  ['36', 'cyan'],
  ['37', 'white'],

  ['39', '/color'],

  ['40', 'backgroundBlack'],
  ['41', 'backgroundRed'],
  ['42', 'backgroundGreen'],
  ['43', 'backgroundYellow'],
  ['44', 'backgroundBlue'],
  ['45', 'backgroundMagenta'],
  ['46', 'backgroundCyan'],
  ['47', 'backgroundWhite'],

  ['49', '/background'],

  ['53', 'overline'],

  ['55', '/overline'],

  ['90', 'gray'],
  ['91', 'brightRed'],
  ['92', 'brightGreen'],
  ['93', 'brightYellow'],
  ['94', 'brightBlue'],
  ['95', 'brightMagenta'],
  ['96', 'brightCyan'],
  ['97', 'brightWhite'],

  ['100', 'backgroundGray'],
  ['101', 'backgroundBrightRed'],
  ['102', 'backgroundBrightGreen'],
  ['103', 'backgroundBrightYellow'],
  ['104', 'backgroundBrightBlue'],
  ['105', 'backgroundBrightMagenta'],
  ['106', 'backgroundBrightCyan'],
  ['107', 'backgroundBrightWhite'],
]);

/**
 * Replace a color or style references
 * @param {string} sequenceText the original text
 * @returns {string} the replaced text
 */
function colorOrStyleSequenceReplacer(sequenceText) {
  /** @type {string[]} */
  const replacement = [];

  const colorParameters = sequenceText.match(/\d{1,3}/g) || ['0'];

  colorParameters.forEach((colorParameter) => {
    replacement.push(colorText.get(colorParameter) || '?');
  });

  return `<${replacement.join(', ')}>`;
}

/**
 * Replace ANSI escape sequences with their name
 * @param {string} text the original text
 * @returns {string} the replaced text
 */
function serializeAnsi(text) {
  return (
    text
      .replace(/\u001b\[(\d*;?)*m/g, colorOrStyleSequenceReplacer)
      .replace(/.(?=\u001b)/g, (match) => `${match}\n`)
      .replace(
        /\u001b\[2J\n?\u001b\[(3J\n?\u001b\[H|0f)\n?/g,
        '<clearTerminal>\n'
      )
      // Move commands not implemented
      // .replace(/\u001b\[\d*[A-FST]\n?/g, moveCursorByReplacer)
      // .replace(/\u001b\[\d*G\n?/g, moveCursorToReplacer)
      // .replace(/\u001b\[\d*;?\d*[Hf]\n?/g, moveCursorToReplacer)
      .replace(/\u001b\[0?J\n?/g, '<eraseScreenDown>\n')
      .replace(/\u001b\[1J\n?/g, '<eraseScreenUp>\n')
      .replace(/\u001b\[2J\n?/g, '<eraseScreen>\n')
      .replace(/\u001b\[3J\n?/g, '<eraseScreenAndDeleteBuffer>\n')
      .replace(/\u001b\[0?K\n?/g, '<eraseLineEnd>\n')
      .replace(/\u001b\[1K\n?/g, '<eraseLineStart>\n')
      .replace(/\u001b\[2K\n?/g, '<eraseLine>\n')
      .replace(/\u001b\[6n\n?/g, '<getCursorPosition>\n')
      .replace(/\u001b(\[s|7)\n?/g, '<saveCursorPosition>\n')
      .replace(/\u001b(\[u|8)\n?/g, '<restoreCursorPosition>\n')
      .replace(/\u001b\[\?25h\n?/g, '<showCursor>\n')
      .replace(/\u001b\[\?25l\n?/g, '<hideCursor>\n')
      .replace(escape, '<ESC>')
  );
}

/** @type {jest.SnapshotSerializerPlugin} */
const ansiEscapesSerializer = {
  // eslint-disable-next-line max-params
  serialize(text, config, indentation, depth, refs, printer) {
    return printer(serializeAnsi(text), config, indentation, depth, refs);
  },
  test(val) {
    return typeof val === 'string' && val.includes(escape);
  },
};

module.exports = ansiEscapesSerializer;
