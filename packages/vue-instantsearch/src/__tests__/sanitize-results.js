import sanitizeResults from '../sanitize-results';

test('it ensures results are provided in the correct format', () => {
  expect(() => {
    sanitizeResults();
  }).toThrow(new TypeError('Results should be provided as an array.'));

  expect(() => {
    sanitizeResults({});
  }).toThrow(new TypeError('Results should be provided as an array.'));
});

test('it ensures tags are provided in the correct format', () => {
  const expectedException = new TypeError(
    'safePreTag and safePostTag should be provided as strings.'
  );
  expect(() => {
    sanitizeResults([]);
  }).toThrow(expectedException);

  expect(() => {
    sanitizeResults([], 'pre');
  }).toThrow(expectedException);

  expect(() => {
    sanitizeResults([], {}, 'post');
  }).toThrow(expectedException);
});

test('it should escape HTML of highlighted values', () => {
  const results = [
    {
      name: 'name',
      _highlightResult: {
        name: {
          value: "<script>alert('Yay')</script>",
          matchLevel: 'full',
        },
      },
    },
  ];

  const sanitized = sanitizeResults(results, 'pre', 'post');

  expect(sanitized).toEqual([
    {
      name: 'name',
      _highlightResult: {
        name: {
          value: '&lt;script&gt;alert(&#39;Yay&#39;)&lt;/script&gt;',
          matchLevel: 'full',
        },
      },
    },
  ]);
});

test('it should escape HTML of snippetted values', () => {
  const results = [
    {
      name: 'name',
      _snippetResult: {
        name: {
          value: "<script>alert('Yay')</script>",
          matchLevel: 'full',
        },
      },
    },
  ];

  const sanitized = sanitizeResults(results, 'pre', 'post');

  expect(sanitized).toEqual([
    {
      name: 'name',
      _snippetResult: {
        name: {
          value: '&lt;script&gt;alert(&#39;Yay&#39;)&lt;/script&gt;',
          matchLevel: 'full',
        },
      },
    },
  ]);
});

test('it should not escape HTML of non highlighted attributes', () => {
  const results = [
    {
      name: '<h1>Test</h1>',
    },
  ];

  const sanitized = sanitizeResults(results, 'pre', 'post');
  expect(sanitized).toEqual(results);
});

test('it should replace pre-post tags in highlighted values', () => {
  const results = [
    {
      name: 'name',
      _snippetResult: {
        name: {
          value: 'My __ais-highlight__resu__/ais-highlight__lt',
          matchLevel: 'full',
        },
      },
    },
  ];

  const sanitized = sanitizeResults(
    results,
    '__ais-highlight__',
    '__/ais-highlight__'
  );
  expect(sanitized).toEqual([
    {
      name: 'name',
      _snippetResult: {
        name: {
          value: 'My <em>resu</em>lt',
          matchLevel: 'full',
        },
      },
    },
  ]);
});

test('it should replace multiple occurrences of pre-post tags in highlighted values', () => {
  const results = [
    {
      name: 'name',
      _snippetResult: {
        name: {
          value:
            '__ais-highlight__My__/ais-highlight__ __ais-highlight__resu__/ais-highlight__lt',
          matchLevel: 'full',
        },
      },
    },
  ];

  const sanitized = sanitizeResults(
    results,
    '__ais-highlight__',
    '__/ais-highlight__'
  );
  expect(sanitized).toEqual([
    {
      name: 'name',
      _snippetResult: {
        name: {
          value: '<em>My</em> <em>resu</em>lt',
          matchLevel: 'full',
        },
      },
    },
  ]);
});

test('it should handle nested attributes', () => {
  const results = [
    {
      name: 'name',
      _snippetResult: {
        tags: [
          {
            value: '__ais-highlight__Ta__/ais-highlight__g 2',
            matchLevel: 'full',
          },
          {
            value: '__ais-highlight__Ta__/ais-highlight__g 2',
            matchLevel: 'full',
          },
        ],
      },
    },
  ];

  const sanitized = sanitizeResults(
    results,
    '__ais-highlight__',
    '__/ais-highlight__'
  );
  expect(sanitized).toEqual([
    {
      name: 'name',
      _snippetResult: {
        tags: [
          {
            value: '<em>Ta</em>g 2',
            matchLevel: 'full',
          },
          {
            value: '<em>Ta</em>g 2',
            matchLevel: 'full',
          },
        ],
      },
    },
  ]);
});

test('it should handle deeply nested attributes', () => {
  const results = [
    {
      name: 'name',
      _snippetResult: {
        info: {
          tags: [
            {
              value: '__ais-highlight__Ta__/ais-highlight__g 2',
              matchLevel: 'full',
            },
            {
              value: '__ais-highlight__Ta__/ais-highlight__g 2',
              matchLevel: 'full',
            },
          ],
        },
      },
    },
  ];

  const sanitized = sanitizeResults(
    results,
    '__ais-highlight__',
    '__/ais-highlight__'
  );
  expect(sanitized).toEqual([
    {
      name: 'name',
      _snippetResult: {
        info: {
          tags: [
            {
              value: '<em>Ta</em>g 2',
              matchLevel: 'full',
            },
            {
              value: '<em>Ta</em>g 2',
              matchLevel: 'full',
            },
          ],
        },
      },
    },
  ]);
});
