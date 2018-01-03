import escapeHits from '../escape-highlight';

describe('escapeHits()', () => {
  it('should escape highlighProperty simple text value', () => {
    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: '<script>__ais-highlight__foobar__/ais-highlight__</script>',
          },
        },
        _snippetResult: {
          foobar: {
            value: '<script>__ais-highlight__foobar__/ais-highlight__</script>',
          },
        },
      },
    ];

    expect(escapeHits(hits)).toEqual([
      {
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
      },
    ]);
  });

  it('should escape highlighProperty nested object value', () => {
    const hits = [
      {
        _highlightResult: {
          foo: {
            bar: {
              value:
                '<script>__ais-highlight__foobar__/ais-highlight__</script>',
            },
          },
        },
        _snippetResult: {
          foo: {
            bar: {
              value:
                '<script>__ais-highlight__foobar__/ais-highlight__</script>',
            },
          },
        },
      },
    ];

    expect(escapeHits(hits)).toEqual([
      {
        _highlightResult: {
          foo: {
            bar: {
              value: '&lt;script&gt;<em>foobar</em>&lt;/script&gt;',
            },
          },
        },
        _snippetResult: {
          foo: {
            bar: {
              value: '&lt;script&gt;<em>foobar</em>&lt;/script&gt;',
            },
          },
        },
      },
    ]);
  });

  it('should escape highlighProperty array of string', () => {
    const hits = [
      {
        _highlightResult: {
          foobar: [
            {
              value: '<script>__ais-highlight__bar__/ais-highlight__</script>',
            },
            {
              value: '<script>__ais-highlight__foo__/ais-highlight__</script>',
            },
          ],
        },
        _snippetResult: {
          foobar: [
            {
              value: '<script>__ais-highlight__bar__/ais-highlight__</script>',
            },
            {
              value: '<script>__ais-highlight__foo__/ais-highlight__</script>',
            },
          ],
        },
      },
    ];

    expect(escapeHits(hits)).toEqual([
      {
        _highlightResult: {
          foobar: [
            { value: '&lt;script&gt;<em>bar</em>&lt;/script&gt;' },
            { value: '&lt;script&gt;<em>foo</em>&lt;/script&gt;' },
          ],
        },
        _snippetResult: {
          foobar: [
            { value: '&lt;script&gt;<em>bar</em>&lt;/script&gt;' },
            { value: '&lt;script&gt;<em>foo</em>&lt;/script&gt;' },
          ],
        },
      },
    ]);
  });

  it('should escape highlighProperty array of object', () => {
    const hits = [
      {
        _highlightResult: {
          foobar: [
            {
              foo: {
                bar: {
                  value:
                    '<script>__ais-highlight__bar__/ais-highlight__</script>',
                },
              },
            },
            {
              foo: {
                bar: {
                  value:
                    '<script>__ais-highlight__foo__/ais-highlight__</script>',
                },
              },
            },
          ],
        },
        _snippetResult: {
          foobar: [
            {
              foo: {
                bar: {
                  value:
                    '<script>__ais-highlight__bar__/ais-highlight__</script>',
                },
              },
            },
            {
              foo: {
                bar: {
                  value:
                    '<script>__ais-highlight__foo__/ais-highlight__</script>',
                },
              },
            },
          ],
        },
      },
    ];

    expect(escapeHits(hits)).toEqual([
      {
        _highlightResult: {
          foobar: [
            {
              foo: {
                bar: {
                  value: '&lt;script&gt;<em>bar</em>&lt;/script&gt;',
                },
              },
            },
            {
              foo: {
                bar: {
                  value: '&lt;script&gt;<em>foo</em>&lt;/script&gt;',
                },
              },
            },
          ],
        },
        _snippetResult: {
          foobar: [
            {
              foo: {
                bar: {
                  value: '&lt;script&gt;<em>bar</em>&lt;/script&gt;',
                },
              },
            },
            {
              foo: {
                bar: {
                  value: '&lt;script&gt;<em>foo</em>&lt;/script&gt;',
                },
              },
            },
          ],
        },
      },
    ]);
  });

  it('should not escape twice the same results', () => {
    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: '<script>__ais-highlight__foo__/ais-highlight__</script>',
          },
        },
      },
    ];

    escapeHits(hits);
    escapeHits(hits);

    const output = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<em>foo</em>&lt;/script&gt;',
          },
        },
      },
    ];

    output.__escaped = true;

    expect(hits).toEqual(output);
  });
});
