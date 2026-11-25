import fs from 'fs';
import path from 'path';

import { failureEnvelope, formatEnvelope, successEnvelope } from './envelope';
import { readManifest } from './manifest';
import { npxCommand } from './program-name';

import type { IO } from './io';

const COMMAND = 'agents-md';
export const BEGIN_MARKER = '<!-- BEGIN:instantsearch-agent-rules -->';
export const END_MARKER = '<!-- END:instantsearch-agent-rules -->';

const FLAVORS = [
  {
    pkg: 'react-instantsearch',
    label: 'React InstantSearch',
    docs: 'https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react.md',
    legacy:
      'React InstantSearch v6 (`react-instantsearch-dom`) and Hooks-era (`react-instantsearch-hooks-web`)',
  },
  {
    pkg: 'vue-instantsearch',
    label: 'Vue InstantSearch',
    docs: 'https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/vue.md',
    legacy: 'Vue InstantSearch v2/v3',
  },
  {
    pkg: 'instantsearch.js',
    label: 'InstantSearch.js',
    docs: 'https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js.md',
    legacy: 'InstantSearch.js v2/v3 (`addWidget`, string templates)',
  },
] as const;

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

export type AgentsMdOptions = { cwd: string; json: boolean };

export async function runAgentsMd(
  options: AgentsMdOptions,
  io: IO
): Promise<number> {
  const rules = renderAgentRules(options.cwd);
  if (!rules) {
    emit(
      io,
      options.json,
      failureEnvelope(
        COMMAND,
        'instantsearch_not_installed',
        `No InstantSearch package found in package.json. Run \`${npxCommand(
          'init'
        )}\` first.`
      )
    );
    return 1;
  }

  const filesCreated: string[] = [];
  const filesModified: string[] = [];

  const agentsPath = path.join(options.cwd, 'AGENTS.md');
  const existing = fs.existsSync(agentsPath)
    ? fs.readFileSync(agentsPath, 'utf8')
    : null;
  const next = upsertBlock(existing ?? '', rules);
  if (existing === null) {
    fs.writeFileSync(agentsPath, next, 'utf8');
    filesCreated.push(agentsPath);
  } else if (next !== existing) {
    fs.writeFileSync(agentsPath, next, 'utf8');
    filesModified.push(agentsPath);
  }

  // Claude Code reads AGENTS.md only when there is no CLAUDE.md, unless CLAUDE.md imports it.
  const claudePath = path.join(options.cwd, 'CLAUDE.md');
  if (fs.existsSync(claudePath)) {
    const claude = fs.readFileSync(claudePath, 'utf8');
    if (!/^@AGENTS\.md\s*$/m.test(claude)) {
      const separator = claude.endsWith('\n') ? '' : '\n';
      fs.writeFileSync(
        claudePath,
        `${claude}${separator}\n@AGENTS.md\n`,
        'utf8'
      );
      filesModified.push(claudePath);
    }
  }

  emit(
    io,
    options.json,
    successEnvelope(COMMAND, {
      filesCreated,
      filesModified,
      nextSteps: [
        'Commit AGENTS.md so every coding agent session sees the InstantSearch rules.',
      ],
    })
  );
  return 0;
}

export function upsertBlock(contents: string, block: string): string {
  const start = contents.indexOf(BEGIN_MARKER);
  const end = contents.indexOf(END_MARKER);
  if (start !== -1 && end > start) {
    return (
      contents.slice(0, start) + block + contents.slice(end + END_MARKER.length)
    );
  }
  if (!contents.trim()) return `${block}\n`;
  const separator = contents.endsWith('\n') ? '\n' : '\n\n';
  return `${contents}${separator}${block}\n`;
}

/** The managed block for this project, or null when no InstantSearch package is installed. */
export function renderAgentRules(cwd: string): string | null {
  const pkg = readJson<PackageJson>(path.join(cwd, 'package.json'));
  const deps = {
    ...(pkg?.dependencies ?? {}),
    ...(pkg?.devDependencies ?? {}),
  };
  const flavor = FLAVORS.find((candidate) => candidate.pkg in deps);
  if (!flavor) return null;

  const version = (name: string) =>
    readJson<{ version?: string }>(
      path.join(cwd, 'node_modules', name, 'package.json')
    )?.version ?? deps[name];
  const packages = [
    `${flavor.pkg} ${version(flavor.pkg)}`,
    ...(deps['react-instantsearch-nextjs']
      ? [`react-instantsearch-nextjs ${version('react-instantsearch-nextjs')}`]
      : []),
    ...(deps.algoliasearch
      ? [`algoliasearch ${version('algoliasearch')}`]
      : []),
  ];

  const manifest = readManifest(path.join(cwd, 'instantsearch.json'), {
    command: COMMAND,
  });
  const lines = [
    BEGIN_MARKER,
    '## Algolia InstantSearch',
    '',
    `This project uses ${flavor.label}: ${packages.join(', ')}. Your training data likely includes ${flavor.legacy} code; it does not apply here.`,
    '',
  ];
  if (manifest.ok) {
    const libPath = manifest.manifest.libPath;
    const ext = manifest.manifest.typescript ? 'ts' : 'js';
    lines.push(
      `- The search client lives in \`${libPath}/algolia-client.${ext}\` and the provider in \`${libPath}/algolia-provider.${ext}x\`. Reuse them; don't create clients inside components.`
    );
    if (manifest.manifest.algolia.indexName) {
      lines.push(
        `- The main index is \`${manifest.manifest.algolia.indexName}\`. Run \`${npxCommand(
          'introspect --json'
        )}\` for its facets and a suggested widget plan.`
      );
    }
  }
  lines.push(
    `- Check widget, hook, and connector props against the installed types in \`node_modules/${flavor.pkg}\` before using them.`,
    `- Docs: ${flavor.docs} (append \`.md\` to any Algolia docs URL to get Markdown).`,
    '- Only the application ID and the search-only API key may reach the browser. Write and admin keys stay server-side.'
  );
  if (deps['react-instantsearch-nextjs'] && nextCacheComponentsEnabled(cwd)) {
    lines.push(
      '- `cacheComponents` is enabled in next.config: render `InstantSearchNext` under a server component that awaits `connection()` from `next/server`, inside `<Suspense>`. Otherwise `next build` fails with "`headers` must not be used within a client component".'
    );
  }
  lines.push(
    '- After changing search UI, open the page, type a query, and apply a refinement before reporting success.',
    '',
    `Managed by Create InstantSearch App (\`${npxCommand(
      'agents-md'
    )}\`). Add your own notes outside these markers.`,
    END_MARKER
  );
  return lines.join('\n');
}

export function nextCacheComponentsEnabled(cwd: string): boolean {
  for (const file of ['next.config.ts', 'next.config.mjs', 'next.config.js']) {
    try {
      const source = fs.readFileSync(path.join(cwd, file), 'utf8');
      if (/cacheComponents\s*:\s*true/.test(source)) return true;
    } catch {
      // try the next config file name
    }
  }
  return false;
}

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function emit(
  io: IO,
  json: boolean,
  envelope:
    | ReturnType<typeof successEnvelope>
    | ReturnType<typeof failureEnvelope>
): void {
  if (json) {
    io.stdout(formatEnvelope(envelope));
    return;
  }
  if (!envelope.ok) {
    io.stderr(`${envelope.message}\n`);
    return;
  }
  const changed = [...envelope.filesCreated, ...(envelope.filesModified ?? [])];
  io.stdout(
    changed.length > 0
      ? `agents-md: updated ${changed.map((file) => path.basename(file)).join(', ')}\n`
      : 'agents-md: already up to date\n'
  );
}
