import fs from 'fs';
import os from 'os';
import path from 'path';

import { BEGIN_MARKER, END_MARKER, runAgentsMd } from '../agents-md';

function tempProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'instantsearch-agents-md-')
  );
  for (const [name, contents] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), contents, 'utf8');
  }
  return dir;
}

async function agentsMd(cwd: string) {
  const stdout: string[] = [];
  const exitCode = await runAgentsMd(
    { cwd, json: true },
    { stdout: (c) => stdout.push(c), stderr: () => undefined }
  );
  return { exitCode, envelope: JSON.parse(stdout.join('')) };
}

const nextProject = {
  'package.json': JSON.stringify({
    dependencies: {
      next: '16.4.6',
      'react-instantsearch': '7.55.1',
      'react-instantsearch-nextjs': '1.4.17',
      algoliasearch: '5.65.0',
    },
  }),
  'next.config.ts': 'export default { cacheComponents: true };\n',
  'instantsearch.json': JSON.stringify({
    flavor: 'react',
    framework: 'next-app',
    typescript: true,
    componentsPath: 'components',
    libPath: 'lib',
    aliases: {},
    algolia: {
      appId: 'latency',
      searchApiKey: 'k',
      indexName: 'instant_search',
    },
    features: [],
  }),
};

describe('agents-md', () => {
  it('creates AGENTS.md with a project-specific managed block', async () => {
    const cwd = tempProject(nextProject);
    const { exitCode, envelope } = await agentsMd(cwd);

    expect(exitCode).toBe(0);
    expect(envelope.filesCreated).toEqual([path.join(cwd, 'AGENTS.md')]);
    const contents = fs.readFileSync(path.join(cwd, 'AGENTS.md'), 'utf8');
    expect(contents.startsWith(BEGIN_MARKER)).toBe(true);
    expect(contents).toContain(END_MARKER);
    expect(contents).toContain('react-instantsearch 7.55.1');
    expect(contents).toContain('react-instantsearch-dom');
    expect(contents).toContain('`lib/algolia-client.ts`');
    expect(contents).toContain('`instant_search`');
    expect(contents).toContain('connection()');
  });

  it('replaces only its own block and keeps the rest of AGENTS.md', async () => {
    const cwd = tempProject({
      ...nextProject,
      'AGENTS.md': `# Project rules\n\nUse pnpm.\n\n${BEGIN_MARKER}\nold block\n${END_MARKER}\n\nMore notes.\n`,
    });
    const { envelope } = await agentsMd(cwd);

    expect(envelope.filesModified).toEqual([path.join(cwd, 'AGENTS.md')]);
    const contents = fs.readFileSync(path.join(cwd, 'AGENTS.md'), 'utf8');
    expect(contents).toContain('# Project rules\n\nUse pnpm.');
    expect(contents).toContain('More notes.');
    expect(contents).not.toContain('old block');
    expect(contents.split(BEGIN_MARKER)).toHaveLength(2);

    const second = await agentsMd(cwd);
    expect(second.envelope.filesModified).toBeUndefined();
    expect(second.envelope.filesCreated).toEqual([]);
  });

  it('imports AGENTS.md from an existing CLAUDE.md exactly once', async () => {
    const cwd = tempProject({ ...nextProject, 'CLAUDE.md': '# Claude notes' });
    await agentsMd(cwd);
    await agentsMd(cwd);
    const claude = fs.readFileSync(path.join(cwd, 'CLAUDE.md'), 'utf8');
    expect(claude.match(/^@AGENTS\.md$/gm)).toHaveLength(1);
    expect(claude.startsWith('# Claude notes')).toBe(true);
  });

  it('refuses when no InstantSearch package is installed', async () => {
    const cwd = tempProject({
      'package.json': JSON.stringify({ dependencies: { react: '19.0.0' } }),
    });
    const { exitCode, envelope } = await agentsMd(cwd);
    expect(exitCode).toBe(1);
    expect(envelope).toMatchObject({
      ok: false,
      code: 'instantsearch_not_installed',
    });
    expect(fs.existsSync(path.join(cwd, 'AGENTS.md'))).toBe(false);
  });
});
