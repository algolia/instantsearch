import { completeStreamingMarkdown } from '../completeStreamingMarkdown';

describe('completeStreamingMarkdown backtracking', () => {
  // It runs on every streamed delta, so a quadratic scan of the reply would
  // freeze the page on adversarial model output.
  function timeOf(run: () => void) {
    const start = performance.now();
    run();
    return performance.now() - start;
  }

  test.each([
    ['unclosed brackets', `${'['.repeat(50000)}]x`],
    ['spaces after a bold marker', `**${' '.repeat(50000)}x`],
    ['spaces before a marker', `${' '.repeat(50000)}x*`],
    ['indented lines', `**${'\n   '.repeat(50000)}x`],
  ])('%s are completed in linear-ish time', (_, text) => {
    expect(timeOf(() => completeStreamingMarkdown(text))).toBeLessThan(500);
  });
});
