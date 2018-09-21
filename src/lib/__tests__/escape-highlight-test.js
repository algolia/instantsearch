import escapeHits from '../escape-highlight';

describe('escapeHits()', () => {
  it('should escape highlightProperty simple text value', () => {
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

    const output = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
          },
        },
        _snippetResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
          },
        },
      },
    ];

    output.__escaped = true;
    expect(escapeHits(hits)).toEqual(output);
  });

  it('should escape highlightProperty nested object value', () => {
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

    const output = [
      {
        _highlightResult: {
          foo: {
            bar: {
              value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
            },
          },
        },
        _snippetResult: {
          foo: {
            bar: {
              value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
            },
          },
        },
      },
    ];

    output.__escaped = true;
    expect(escapeHits(hits)).toEqual(output);
  });

  it('should escape highlightProperty array of string', () => {
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

    const output = [
      {
        _highlightResult: {
          foobar: [
            { value: '&lt;script&gt;<mark>bar</mark>&lt;/script&gt;' },
            { value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;' },
          ],
        },
        _snippetResult: {
          foobar: [
            { value: '&lt;script&gt;<mark>bar</mark>&lt;/script&gt;' },
            { value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;' },
          ],
        },
      },
    ];

    output.__escaped = true;
    expect(escapeHits(hits)).toEqual(output);
  });

  it('should escape highlightProperty array of object', () => {
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

    const output = [
      {
        _highlightResult: {
          foobar: [
            {
              foo: {
                bar: {
                  value: '&lt;script&gt;<mark>bar</mark>&lt;/script&gt;',
                },
              },
            },
            {
              foo: {
                bar: {
                  value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;',
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
                  value: '&lt;script&gt;<mark>bar</mark>&lt;/script&gt;',
                },
              },
            },
            {
              foo: {
                bar: {
                  value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;',
                },
              },
            },
          ],
        },
      },
    ];
    output.__escaped = true;
    expect(escapeHits(hits)).toEqual(output);
  });

  it('should not escape twice the same results', () => {
    let hits = [
      {
        _highlightResult: {
          foobar: {
            value: '<script>__ais-highlight__foo__/ais-highlight__</script>',
          },
        },
      },
    ];

    hits = escapeHits(hits);
    hits = escapeHits(hits);

    const output = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;',
          },
        },
      },
    ];

    output.__escaped = true;

    expect(hits).toEqual(output);
  });
});
