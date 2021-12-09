import { escapeHits } from '../escape-highlight';

describe('escapeHits()', () => {
  it('should escape highlightProperty simple text value', () => {
    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: '<script>__ais-highlight__foobar__/ais-highlight__</script>',
            matchLevel: 'full' as const,
            matchedWords: [],
          },
        },
        _snippetResult: {
          foobar: {
            value: '<script>__ais-highlight__foobar__/ais-highlight__</script>',
            matchLevel: 'full' as const,
            matchedWords: [],
          },
        },
        objectID: '1',
        __position: 1,
      },
    ];

    const output = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
            matchLevel: 'full' as const,
            matchedWords: [],
          },
        },
        _snippetResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
            matchLevel: 'full' as const,
            matchedWords: [],
          },
        },
        objectID: '1',
        __position: 1,
      },
    ];

    (output as any).__escaped = true;
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
              matchLevel: 'full' as const,
              matchedWords: [],
            },
          },
        },
        _snippetResult: {
          foo: {
            bar: {
              value:
                '<script>__ais-highlight__foobar__/ais-highlight__</script>',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
          },
        },
        objectID: '1',
        __position: 1,
      },
    ];

    const output = [
      {
        _highlightResult: {
          foo: {
            bar: {
              value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
          },
        },
        _snippetResult: {
          foo: {
            bar: {
              value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
          },
        },
        objectID: '1',
        __position: 1,
      },
    ];

    (output as any).__escaped = true;
    expect(escapeHits(hits)).toEqual(output);
  });

  it('should escape highlightProperty array of string', () => {
    const hits = [
      {
        _highlightResult: {
          foobar: [
            {
              value: '<script>__ais-highlight__bar__/ais-highlight__</script>',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
            {
              value: '<script>__ais-highlight__foo__/ais-highlight__</script>',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
          ],
        },
        _snippetResult: {
          foobar: [
            {
              value: '<script>__ais-highlight__bar__/ais-highlight__</script>',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
            {
              value: '<script>__ais-highlight__foo__/ais-highlight__</script>',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
          ],
        },
        objectID: '1',
        __position: 1,
      },
    ];

    const output = [
      {
        _highlightResult: {
          foobar: [
            {
              value: '&lt;script&gt;<mark>bar</mark>&lt;/script&gt;',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
            {
              value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
          ],
        },
        _snippetResult: {
          foobar: [
            {
              value: '&lt;script&gt;<mark>bar</mark>&lt;/script&gt;',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
            {
              value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;',
              matchLevel: 'full' as const,
              matchedWords: [],
            },
          ],
        },
        objectID: '1',
        __position: 1,
      },
    ];

    (output as any).__escaped = true;
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
                  matchLevel: 'full' as const,
                  matchedWords: [],
                },
              },
            },
            {
              foo: {
                bar: {
                  value:
                    '<script>__ais-highlight__foo__/ais-highlight__</script>',
                  matchLevel: 'full' as const,
                  matchedWords: [],
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
                  matchLevel: 'full' as const,
                  matchedWords: [],
                },
              },
            },
            {
              foo: {
                bar: {
                  value:
                    '<script>__ais-highlight__foo__/ais-highlight__</script>',
                  matchLevel: 'full' as const,
                  matchedWords: [],
                },
              },
            },
          ],
        },
        objectID: '1',
        __position: 1,
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
                  matchLevel: 'full' as const,
                  matchedWords: [],
                },
              },
            },
            {
              foo: {
                bar: {
                  value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;',
                  matchLevel: 'full' as const,
                  matchedWords: [],
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
                  matchLevel: 'full' as const,
                  matchedWords: [],
                },
              },
            },
            {
              foo: {
                bar: {
                  value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;',
                  matchLevel: 'full' as const,
                  matchedWords: [],
                },
              },
            },
          ],
        },
        objectID: '1',
        __position: 1,
      },
    ];
    (output as any).__escaped = true;
    expect(escapeHits(hits)).toEqual(output);
  });

  it('should not escape twice the same results', () => {
    let hits = [
      {
        _highlightResult: {
          foobar: {
            value: '<script>__ais-highlight__foo__/ais-highlight__</script>',
            matchLevel: 'full' as const,
            matchedWords: [],
          },
        },
        objectID: '1',
        __position: 1,
      },
    ];

    hits = escapeHits(hits);
    hits = escapeHits(hits);

    const output = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foo</mark>&lt;/script&gt;',
            matchLevel: 'full' as const,
            matchedWords: [],
          },
        },
        objectID: '1',
        __position: 1,
      },
    ];

    (output as any).__escaped = true;

    expect(hits).toEqual(output);
  });

  it('should not mutate the hit', () => {
    const hit = {
      _highlightResult: {
        foobar: {
          value: '<script>__ais-highlight__foo__/ais-highlight__</script>',
          matchLevel: 'full' as const,
          matchedWords: [],
        },
      },
      objectID: '1',
      __position: 1,
    };

    const hits = [hit];

    escapeHits(hits);

    expect(hit).toEqual({
      _highlightResult: {
        foobar: {
          value: '<script>__ais-highlight__foo__/ais-highlight__</script>',
          matchLevel: 'full' as const,
          matchedWords: [],
        },
      },
      objectID: '1',
      __position: 1,
    });
  });
});
