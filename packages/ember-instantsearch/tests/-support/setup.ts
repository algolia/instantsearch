import * as domMatchers from '@testing-library/jest-dom/matchers';
import { format, plugins } from '@vitest/pretty-format';
import { beforeEach, expect, vi } from 'vitest';

/**
 * The shared suites in `tests/common` are written for Jest.
 *
 * Vitest has the same `describe`, `test`, and `expect` globals,
 * and `vi` has the same mock API as `jest`.
 */
Object.assign(globalThis, { jest: vi });

expect.extend(domMatchers);

const serializers = [plugins.DOMElement, plugins.DOMCollection];

/**
 * Jest stores an inline snapshot with one level of indentation
 * and a line break before and after.
 */
function stripIndentation(snapshot: string) {
  const lines = snapshot.split('\n');

  if (lines.length < 3) return snapshot.trim();

  const indentation = /^\s*/.exec(lines[1] ?? '')?.[0] ?? '';
  const stripped: string[] = [];

  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i] ?? '';

    stripped.push(
      line.startsWith(indentation) ? line.slice(indentation.length) : line
    );
  }

  return stripped.join('\n').trim();
}

expect.extend({
  /**
   * The Jest matcher in `tests/utils/matchers` calls into `jest-snapshot`.
   *
   * The shared snapshots are written by Jest and never by this package,
   * so a comparison with the same serializer is enough.
   */
  toMatchNormalizedInlineSnapshot(
    received: Element,
    normalizeFn: (html: string) => string,
    snapshot = ''
  ) {
    const normalized = document.createElement('div');
    normalized.innerHTML = normalizeFn(received.outerHTML);

    const actual = format(normalized.firstChild, {
      plugins: serializers,
      printBasicPrototype: false,
    });
    const expected = stripIndentation(snapshot);

    return {
      pass: actual === expected,
      message: () =>
        `Normalized snapshot does not match:\n\n${this.utils.diff(
          expected,
          actual
        )}`,
    };
  },
});

/**
 * A click with a modifier key on a link opens a new tab in a real browser,
 * and a new tab would load the test page again.
 * The widgets leave such a click to the browser, as they should,
 * so the tests stop it here, after the widgets saw it.
 */
window.addEventListener('click', (event) => {
  if (event.target instanceof Element && event.target.closest('a')) {
    event.preventDefault();
  }
});

/**
 * The routing suites move to `http://localhost/`, the origin of jsdom.
 * The test page has a port, so the same path goes to this origin instead.
 */
const jsdomOrigin = 'http://localhost/';
const pushState = window.history.pushState.bind(window.history);

window.history.pushState = (data, unused, url) => {
  const sameOrigin =
    typeof url === 'string' && url.startsWith(jsdomOrigin)
      ? `${window.location.origin}/${url.slice(jsdomOrigin.length)}`
      : url;

  pushState(data, unused, sameOrigin);
};

beforeEach(() => {
  /**
   * The Jest setup hides these logs as well.
   */
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
