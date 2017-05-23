import escapeHighlight from '../escape-highlight';

describe('escapeHighlight()', () => {
  it('should escape highlighProperty simple text value', () => {
    const input = {
      _snippetResult: {
        foobar: {
          value: '<script>__ais-highlight__foobar__/ais-highlight__</script>',
        },
      },
      _highlightResult: {
        foobar: {
          value: '<script>__ais-highlight__foobar__/ais-highlight__</script>',
        },
      },
    };

    expect(escapeHighlight(input)).toEqual({
      _highlightResult: {
        foobar: {
          value: '&lt;script&gt;<em>foobar</em>&lt;/script&gt;',
        },
      },
      _snippetResult: {
        foobar: {
          value: '&lt;script&gt;<em>foobar</em>&lt;/script&gt;',
        },
      },
    });
  });

  it('should escape highlighProperty nested object value', () => {
    const input = {
      _highlightResult: {
        foobar: {
          value: {
            foo: '<script>__ais-highlight__bar__/ais-highlight__</script>',
            bar: '<script>__ais-highlight__foo__/ais-highlight__</script>',
          },
        },
      },
      _snippetResult: {
        foobar: {
          value: {
            foo: '<script>__ais-highlight__bar__/ais-highlight__</script>',
            bar: '<script>__ais-highlight__foo__/ais-highlight__</script>',
          },
        },
      },
    };

    expect(escapeHighlight(input)).toEqual({
      _highlightResult: {
        foobar: {
          value: {
            foo: '&lt;script&gt;<em>bar</em>&lt;/script&gt;',
            bar: '&lt;script&gt;<em>foo</em>&lt;/script&gt;',
          },
        },
      },
      _snippetResult: {
        foobar: {
          value: {
            foo: '&lt;script&gt;<em>bar</em>&lt;/script&gt;',
            bar: '&lt;script&gt;<em>foo</em>&lt;/script&gt;',
          },
        },
      },
    });
  });

  it('should escape highlighProperty array of string as value', () => {
    const input = {
      _highlightResult: {
        foobar: {
          value: [
            '<script>__ais-highlight__bar__/ais-highlight__</script>',
            '<script>__ais-highlight__foo__/ais-highlight__</script>',
          ],
        },
      },
      _snippetResult: {
        foobar: {
          value: [
            '<script>__ais-highlight__bar__/ais-highlight__</script>',
            '<script>__ais-highlight__foo__/ais-highlight__</script>',
          ],
        },
      },
    };

    expect(escapeHighlight(input)).toEqual({
      _highlightResult: {
        foobar: {
          value: [
            '&lt;script&gt;<em>bar</em>&lt;/script&gt;',
            '&lt;script&gt;<em>foo</em>&lt;/script&gt;',
          ],
        },
      },
      _snippetResult: {
        foobar: {
          value: [
            '&lt;script&gt;<em>bar</em>&lt;/script&gt;',
            '&lt;script&gt;<em>foo</em>&lt;/script&gt;',
          ],
        },
      },
    });
  });
});
