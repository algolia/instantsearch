const {
  parseArgs,
  isSelectionExcluded,
  groupByRule,
  pickAuto,
  buildOutput,
} = require('../pick-rule.cjs');

describe('parseArgs', () => {
  it('returns defaults when given no flags', () => {
    expect(parseArgs([])).toEqual({ rule: 'auto', maxFiles: 20, out: null });
  });

  it('parses --rule and --out as space-separated values', () => {
    expect(parseArgs(['--rule', 'eslint(no-debugger)', '--out', 'x.json']))
      .toEqual({ rule: 'eslint(no-debugger)', maxFiles: 20, out: 'x.json' });
  });

  it('parses --flag=value form', () => {
    expect(parseArgs(['--rule=eslint(no-debugger)', '--max-files=5']))
      .toEqual({ rule: 'eslint(no-debugger)', maxFiles: 5, out: null });
  });

  it.each([
    [['--rule']],
    [['--rule', '--out', 'x']],
    [['--out']],
    [['--max-files']],
  ])('throws when %p is missing a value', (argv) => {
    expect(() => parseArgs(argv)).toThrow(/expects a value/);
  });

  it('throws on unknown flags', () => {
    expect(() => parseArgs(['--nope'])).toThrow(/Unknown argument/);
  });

  it.each([
    ['--max-files=0', /positive integer/],
    ['--max-files=-3', /positive integer/],
    ['--max-files=1.5', /positive integer/],
    ['--max-files=abc', /positive integer/],
  ])('rejects %s', (arg, message) => {
    expect(() => parseArgs([arg])).toThrow(message);
  });
});

describe('isSelectionExcluded', () => {
  it.each([
    ['package.json', true],
    ['packages/foo/package.json', true],
    ['yarn.lock', true],
    ['.oxlintrc.json', true],
    ['lerna.json', true],
    ['tsconfig.json', true],
    ['packages/foo/tsconfig.build.json', true],
    ['examples/react/index.js', true],
    ['.github/workflows/x.yml', true],
    ['.circleci/config.yml', true],
    ['packages/instantsearch-codemods/__testfixtures__/x.ts', true],
    ['packages/create-instantsearch-app/src/templates/foo/index.ts', true],
    ['packages/foo/src/index.ts', false],
    ['packages/foo/tsconfig.ts', false],
    ['packages/foo/src/tsconfig-helper.ts', false],
  ])('classifies %s as excluded=%s', (filename, expected) => {
    expect(isSelectionExcluded(filename)).toBe(expected);
  });
});

describe('groupByRule', () => {
  const diagnostics = [
    { code: 'eslint(no-debugger)', filename: 'packages/a.ts' },
    { code: 'eslint(no-debugger)', filename: 'packages/a.ts' },
    { code: 'eslint(no-debugger)', filename: 'packages/b.ts' },
    { code: 'eslint(prefer-const)', filename: 'packages/a.ts' },
    { code: 'eslint(prefer-const)', filename: 'examples/c.ts' },
    { filename: 'packages/d.ts' },
    { code: 'eslint(no-debugger)' },
  ];

  it('groups by rule, counts violations per file, and skips excluded paths', () => {
    const byRule = groupByRule(diagnostics, new Set());
    expect([...byRule.keys()].sort()).toEqual([
      'eslint(no-debugger)',
      'eslint(prefer-const)',
    ]);
    const noDebugger = byRule.get('eslint(no-debugger)');
    expect(noDebugger.total).toBe(3);
    expect(noDebugger.byFile.get('packages/a.ts')).toBe(2);
    expect(noDebugger.byFile.get('packages/b.ts')).toBe(1);

    const preferConst = byRule.get('eslint(prefer-const)');
    expect(preferConst.total).toBe(1);
    expect(preferConst.byFile.has('examples/c.ts')).toBe(false);
  });

  it('honours the skip list', () => {
    const byRule = groupByRule(diagnostics, new Set(['eslint(no-debugger)']));
    expect([...byRule.keys()]).toEqual(['eslint(prefer-const)']);
  });
});

describe('pickAuto', () => {
  it('picks the rule with the most violations', () => {
    const byRule = new Map([
      ['eslint(a)', { rule: 'eslint(a)', total: 3, byFile: new Map() }],
      ['eslint(b)', { rule: 'eslint(b)', total: 7, byFile: new Map() }],
      ['eslint(c)', { rule: 'eslint(c)', total: 1, byFile: new Map() }],
    ]);
    expect(pickAuto(byRule).rule).toBe('eslint(b)');
  });

  it('returns null when there are no buckets', () => {
    expect(pickAuto(new Map())).toBeNull();
  });
});

describe('buildOutput', () => {
  const bucket = {
    rule: 'eslint(no-debugger)',
    total: 12,
    byFile: new Map([
      ['packages/a.ts', 5],
      ['packages/b.ts', 5],
      ['packages/c.ts', 1],
      ['packages/d.ts', 1],
    ]),
  };

  it('caps in-scope files and reports deferred remainder', () => {
    const out = buildOutput(bucket, 2);
    expect(out.rule).toBe('eslint(no-debugger)');
    expect(out.totalViolations).toBe(12);
    expect(out.totalFiles).toBe(4);
    expect(out.inScopeFiles).toEqual(['packages/a.ts', 'packages/b.ts']);
    expect(out.inScopeViolations).toBe(10);
    expect(out.deferredFiles).toEqual(['packages/c.ts', 'packages/d.ts']);
    expect(out.deferredViolations).toBe(2);
    expect(out.capHit).toBe(true);
  });

  it('reports capHit=false when everything fits', () => {
    const out = buildOutput(bucket, 10);
    expect(out.deferredFiles).toEqual([]);
    expect(out.capHit).toBe(false);
  });

  it('breaks count ties by filename for deterministic ordering', () => {
    const tied = {
      rule: 'eslint(x)',
      total: 4,
      byFile: new Map([
        ['packages/zeta.ts', 2],
        ['packages/alpha.ts', 2],
      ]),
    };
    const out = buildOutput(tied, 10);
    expect(out.inScopeFiles).toEqual(['packages/alpha.ts', 'packages/zeta.ts']);
  });
});
