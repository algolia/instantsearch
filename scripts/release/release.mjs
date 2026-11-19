#!/usr/bin/env node
/**
 * Cuts a prerelease train from the current branch: version every public workspace
 * package with Lerna's conventional-commits rules, then publish it under the npm
 * dist-tag that matches the chosen channel (`beta` → `instantsearch.js@5.0.0-beta.0`
 * on the `beta` tag).
 *
 * It replaces Ship.js for prereleases. Ship.js 0.28 has no notion of one, so
 * `yarn release` on a release branch computes stable versions, and
 * `ship.config.mjs`'s `publishCommand` passes no `--tag`, which would publish
 * them to `latest`. Ship.js keeps owning stable releases on `master`; this script
 * only ever moves a channel tag, never `latest` — see CHANNELS.
 *
 * Graduating a prerelease is not this script's job: merge the branch into
 * `master` and let Ship.js bump `5.0.0-beta.0` to `5.0.0`. It does that for any
 * commit type, because `semver.inc('5.0.0-beta.0', 'patch')` is `5.0.0`. A
 * `--conventional-graduate` run from here would publish `latest` from a release
 * branch, and a wrong stable version can never be taken back.
 *
 * The entry point is the `prerelease` job in `.github/workflows/ci.yml`, run by
 * dispatching that workflow on the branch to release — the branch picked for the
 * dispatch is the branch checked out and released. Locally, `--plan` and
 * `--preflight` are the useful ones; `--publish` needs GitHub's OIDC token.
 *
 * Usage:
 *   node scripts/release/release.mjs --channel beta --plan
 *   node scripts/release/release.mjs --channel beta --publish [--yes]
 *   node scripts/release/release.mjs --channel beta --preflight
 *
 *   --channel <name>   beta | alpha | rc | next (required) — also the dist-tag
 *   --plan             report the versions, then restore the tree: no commit,
 *                      no tag, no push, and the only npm calls are reads
 *   --publish          commit, tag, push, build and publish to npm
 *   --preflight        only check that npm will accept this build (see below)
 *   --yes              skip the confirmation prompt
 *   --allow-unsigned   publish without provenance, for an emergency outside CI
 *
 * Deliberately absent: `--conventional-bump-prerelease`. It turns a breaking
 * commit on `5.0.0-beta.0` into a `premajor`, i.e. `6.0.0-beta.0`. Without it
 * Lerna rolls the prerelease number, so `beta.0` → `beta.1` however the commits
 * are typed — the breaking change is in the content, and the major lands at
 * graduation.
 *
 * ## Provenance
 *
 * Lerna signs a publish only when it can trade the job's OIDC token for a
 * short-lived npm token, and it reports every reason it could not at `verbose`
 * level, which nothing prints: no `id-token: write`, no trusted publisher on the
 * package for this repo + workflow file + environment, a package that is not
 * public. It then goes on to publish, unsigned. A version can never be attested
 * after the fact either — republishing the same version is rejected — so an
 * unsigned beta is unsigned forever.
 *
 * So this script checks both ends:
 *
 *   1. before it writes anything, `--preflight` runs the same exchange Lerna
 *      runs at publish time, once per package. That proves npm accepts this
 *      workflow for it, and so proves the provenance that follows. Nothing
 *      should need setting up for that to pass: the job lives in
 *      `.github/workflows/ci.yml`, and every package's trusted publisher already
 *      names `ci.yml`, because that is what publishes stable here. If one reports
 *      itself blocked, the npm-side form is per package and has no CLI or API —
 *      the package's Access page on npmjs.com, workflow filename `ci.yml` (that
 *      field takes a filename, never a path), environment `npm` — and npm saves
 *      it unverified, so publish within two days or the config expires.
 *   2. after publishing, every version is read back from the registry and must
 *      carry at least one attestation and the expected dist-tag. A missing
 *      attestation fails the run, so the damage at least is loud.
 *
 * Outside GitHub Actions there is no OIDC token to exchange, so a publish from a
 * laptop needs `--allow-unsigned` and is understood to be unsigned.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');
const NPM_REGISTRY = 'https://registry.npmjs.org';
const NPM_HOST = new URL(NPM_REGISTRY).host;

// A channel is both the preid and the dist-tag, so `npm i instantsearch.js@beta`
// is the install command for `--channel beta` and there is nothing to remember.
// Nothing here may map to `latest`: Ship.js owns that tag on `master`, and the
// guard in assertChannel() is what keeps this script from taking it over.
const CHANNELS = {
  beta: 'beta',
  alpha: 'alpha',
  rc: 'rc',
  next: 'next',
};

// The publisher npm matches each package's trusted publisher against. Printed by
// the preflight so the form can be filled in from the log. `ci.yml` is not
// interchangeable with a new workflow file: npm matches the calling workflow's
// filename, and this one is the one already registered on every package.
const TRUSTED_PUBLISHER = {
  repository: 'algolia/instantsearch',
  workflowFilename: 'ci.yml',
  environment: 'npm',
};

function splitEquals(arg) {
  const index = arg.indexOf('=');
  return index === -1
    ? [arg, undefined]
    : [arg.slice(0, index), arg.slice(index + 1)];
}

function usage(message) {
  if (message) {
    process.stderr.write(`release: ${message}\n\n`);
  }

  process.stderr.write(
    [
      'Usage: node scripts/release/release.mjs --channel <name> (--plan | --publish | --preflight)',
      '',
      `  --channel        one of: ${Object.keys(CHANNELS).join(', ')}`,
      '  --plan           report the versions, leave the branch untouched',
      '  --publish        commit, tag, push, build and publish to npm',
      '  --preflight      check that npm will accept a provenanced publish',
      '  --yes            skip the confirmation prompt',
      '  --allow-unsigned publish without provenance, outside CI',
      '',
    ].join('\n')
  );

  process.exit(message ? 1 : 0);
}

function parseArgs(argv) {
  const options = {
    channel: '',
    mode: '',
    yes: false,
    unsigned: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) {
      usage(`unexpected argument ${arg}`);
    }

    const [flag, inlineValue] = splitEquals(arg);

    switch (flag) {
      case '--channel': {
        const value =
          inlineValue === undefined ? argv[(index += 1)] : inlineValue;
        if (value === undefined) {
          usage(`${flag} needs a value`);
        }
        options.channel = value;
        break;
      }
      case '--plan':
      case '--publish':
      case '--preflight':
        if (options.mode) {
          usage(
            `pass only one of --plan / --publish / --preflight (got --${options.mode} and ${arg})`
          );
        }
        options.mode = flag.slice(2);
        break;
      case '--yes':
        options.yes = true;
        break;
      case '--allow-unsigned':
        options.unsigned = true;
        break;
      case '--help':
      case '-h':
        usage();
        break;
      default:
        usage(`unknown argument ${arg}`);
    }
  }

  if (!options.channel) {
    usage(`--channel is required (one of ${Object.keys(CHANNELS).join(', ')})`);
  }
  if (!CHANNELS[options.channel]) {
    usage(
      `unknown channel "${options.channel}" (one of ${Object.keys(CHANNELS).join(', ')})`
    );
  }
  if (!options.mode) {
    usage('pass --plan, --publish or --preflight');
  }

  return options;
}

function run(command, args, options = {}) {
  process.stdout.write(`\n$ ${[command, ...args].join(' ')}\n`);

  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...options.env },
  });

  if (result.error) {
    fail(
      `\`${command} ${args.join(' ')}\` could not start: ${result.error.message}`
    );
  }
  if (result.status !== 0) {
    if (options.allowFail) {
      return result.status === null ? 1 : result.status;
    }
    fail(
      `\`${command} ${args.join(' ')}\` failed with exit code ${result.status}`
    );
  }

  return 0;
}

function capture(command, args) {
  const result = spawnSync(command, args, { cwd: REPO_ROOT, encoding: 'utf8' });

  return result.status === 0 ? result.stdout.trim() : undefined;
}

// `yarn run --silent` because Lerna's own banner would otherwise be part of the
// JSON — this is how ship.config.mjs reads the same list.
function captureJson(command, args) {
  const stdout = capture(command, args);
  if (stdout === undefined) {
    fail(`\`${command} ${args.join(' ')}\` produced no output`);
  }

  try {
    return JSON.parse(stdout);
  } catch (error) {
    fail(
      `\`${command} ${args.join(' ')}\` did not print JSON: ${error.message}\n${stdout.slice(0, 400)}`
    );
  }
}

function fail(message) {
  // Every exit goes through here, including a command that failed halfway
  // through the throwaway version pass, so a plan never leaves rewritten
  // manifests behind for the next run to trip over.
  restoreWorkingTree();
  process.stderr.write(`\nrelease: ${message}\n`);
  process.exit(1);
}

// A synchronous pause for the registry read-back below, without an async
// helper or a child process.
function sleep(milliseconds) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
  } catch {
    // A shared-memory-less runtime: read back without waiting.
  }
}

// Whether the plan's edits are still on disk; nothing else can undo them, since
// a plan is the only mode that writes without committing.
let planEditsOnDisk = false;

function restoreWorkingTree() {
  if (!planEditsOnDisk) {
    return;
  }
  planEditsOnDisk = false;
  run('git', ['checkout', '--', '.']);

  // Tracked files are back at HEAD by definition. A plan writes no new files —
  // it runs without `--changelog` for exactly that reason — so anything here
  // predates the run; name it rather than blame the plan.
  const leftovers = capture('git', ['status', '--porcelain']);
  if (leftovers) {
    process.stdout.write(
      `release: the tree is restored; these untracked files were already there:\n${leftovers}\n`
    );
  }
}

// `5.0.0-beta.0` on channel `beta`.
function matchesChannel(version, channel) {
  return new RegExp(`-${channel}\\.\\d+$`).test(version);
}

function isPrerelease(version) {
  return version.includes('-');
}

function escapeName(name) {
  return name.replace('/', '%2f');
}

// `npm view <name>@<version>` prints the manifest for a version that exists and
// fails for one that does not. Read-only, so it is safe in plan mode.
function isPublished(name, version) {
  return (
    capture('npm', ['view', `${name}@${version}`, 'version']) !== undefined
  );
}

// Every public package in the monorepo goes out in one train, which is what
// Ship.js does too. Lerna 9's `version` takes no `--scope`, so a partial train
// would mean naming the versions by hand. `lerna list` is the set Lerna itself
// will version and publish — it already leaves private packages out.
function readPackages() {
  return captureJson('yarn', [
    'run',
    '--silent',
    'lerna',
    'list',
    '--json',
  ]).map(({ name, version }) => ({ name, version }));
}

function formatTable(before, after) {
  const previous = new Map(before.map(({ name, version }) => [name, version]));

  return [
    '| Package | Current | Next |',
    '|---|---|---|',
    ...after.map(({ name, version }) => {
      const from = previous.get(name);
      const unchanged = from === version;

      return `| \`${name}\` | \`${from}\` | \`${unchanged ? version : `**${version}**`}\` |`;
    }),
  ].join('\n');
}

function assertCleanBranch() {
  const branch = capture('git', [
    'rev-parse',
    '--abbrev-ref',
    '--symbolic',
    'HEAD',
  ]);
  if (!branch || branch === 'HEAD') {
    fail('on a detached commit; check out the branch you want to release');
  }

  // Untracked files are not the concern here — a build artifact or a scratch
  // note should not block a release — but a tracked change would end up in the
  // bump commit Lerna is about to make. The fix-up commit below stages with
  // `git add --update` for the same reason: untracked files never ride along.
  if (capture('git', ['status', '--porcelain', '--untracked-files=no'])) {
    fail(
      [
        'tracked files differ from HEAD; commit or stash them first.',
        '         If they are versions left by an interrupted run, start over with',
        '           git checkout -- .',
      ].join('\n')
    );
  }

  const upstream = capture('git', [
    'rev-parse',
    '--abbrev-ref',
    '--symbolic',
    '@{u}',
  ]);
  if (upstream && upstream !== 'HEAD') {
    const behind = Number(
      capture('git', ['rev-list', '--count', `HEAD..${upstream}`]) || '0'
    );
    if (behind > 0) {
      fail(
        `${branch} is ${behind} commit(s) behind ${upstream}. Lerna bumps from the release tags, ` +
          `so merge the branch up to its remote first — the beta would repeat already released work.`
      );
    }
  }

  return branch;
}

function ask(question) {
  const buffer = Buffer.alloc(256);
  let answer = '';

  process.stdout.write(question);
  while (!answer.includes('\n')) {
    // One line from stdin, without pulling in readline and its async interface:
    // the value of this script is that it reads as one straight line of code.
    const read = fs.readSync(0, buffer, 0, buffer.length, null);
    if (read === 0) {
      break;
    }
    answer += buffer.toString('utf8', 0, read);
  }

  return answer.trim();
}

function confirm({ branch, channel, packages, distTag }) {
  process.stdout.write(
    `\nNothing has been written yet. Typing "release" commits the bump, tags it, pushes ${branch},\n` +
      `and publishes ${packages.length} package(s) to the \`${distTag}\` dist-tag.\n` +
      'The `latest` tag is not reachable from this script.\n' +
      'Run with --plan first to see the exact versions without any of that.\n'
  );

  if (
    ask(`\nType "release" to publish ${channel} from ${branch}: `) !== 'release'
  ) {
    fail('not confirmed; nothing was committed, tagged, pushed or published');
  }
}

function summarize(lines) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines}\n`);
  }
}

// Everything between these markers talks to npm once per package, one at a
// time. That is deliberate, not an oversight: the token trade hits a rate-limited
// write endpoint, the publish path itself runs with `--concurrency 1` because
// parallel Rekor uploads time out, and a build log that names packages in order
// as they are checked is the difference between a stuck release and a guess.
/* eslint-disable no-await-in-loop -- one package at a time, as above */

/**
 * Ask GitHub's runner for the token npm will accept, with the audience Lerna
 * asks for. Returns the claims alongside it because the trusted-publisher form
 * has to match them, and a failed publish is otherwise guesswork. The token is
 * only ever handed to `exchangeForNpmToken`; printing it would put a credential
 * in a public log.
 */
async function mintIdToken() {
  const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

  if (!requestUrl || !requestToken) {
    return {
      detail:
        'the runner was not given an OIDC token — the job needs `permissions: { id-token: write }`',
    };
  }

  const url = new URL(requestUrl);
  url.searchParams.set('audience', `npm:${NPM_HOST}`);

  let body;
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${requestToken}`,
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return {
        detail: `the runner refused the token request: HTTP ${response.status}`,
      };
    }
    body = await response.json();
  } catch (error) {
    return { detail: `the token request failed: ${error.message}` };
  }

  if (!body?.value) {
    return { detail: 'the runner returned a token request with no token' };
  }

  // The same payload Lerna reads to decide whether provenance is allowed.
  const claims = {};
  try {
    Object.assign(
      claims,
      JSON.parse(Buffer.from(body.value.split('.')[1], 'base64').toString())
    );
  } catch {
    // Unreadable claims are not a reason to stop; the exchange still tells us
    // what we need to know.
  }

  return { idToken: body.value, claims };
}

/**
 * The exchange Lerna performs per package right before it publishes: prove to
 * npm that this very workflow may publish this very package, and get a
 * short-lived token for it. A token that comes back means provenance is on —
 * Lerna turns it on for exactly the packages where this exchange succeeds and
 * the package is public. The token itself is dropped: this function only reports.
 */
async function exchangeIsAllowed(idToken, name) {
  const url = new URL(
    `/-/npm/v1/oidc/token/exchange/package/${escapeName(name)}`,
    NPM_REGISTRY
  );

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${idToken}`,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const body = await response.json().catch(() => ({}));
      return body?.token
        ? { ok: true }
        : {
            ok: false,
            trustedPublisher: true,
            detail: 'npm answered without a token',
          };
    }

    const detail = await response.text().catch(() => '');

    return {
      ok: false,
      // npm says this when the package has no trusted publisher for this
      // repo + workflow file + environment, which is the one failure a human
      // can fix in the npm UI without touching code.
      trustedPublisher:
        /trusted|publisher|not allowed|forbidden|oidc/i.test(detail) ||
        response.status === 401 ||
        response.status === 403,
      detail: `HTTP ${response.status} ${detail.slice(0, 200).trim()}`,
    };
  } catch (error) {
    return {
      ok: false,
      detail: `the exchange request failed: ${error.message}`,
    };
  }
}

async function preflight({ packages, fatal }) {
  process.stdout.write(
    '\nrelease: asking npm whether it will accept this build…\n'
  );

  const { idToken, claims = {}, detail } = await mintIdToken();

  if (!idToken) {
    const message = `no OIDC token to exchange: ${detail}`;
    if (fatal) {
      fail(`release: ${message}`);
    }
    process.stdout.write(`release: ${message}\n`);
    return false;
  }

  process.stdout.write(
    `release: token minted for\n` +
      `         sub          ${claims.sub ?? '(unknown)'}\n` +
      `         workflow     ${claims.workflow ?? '(unknown)'}\n` +
      `         visibility   ${claims.repository_visibility ?? '(unknown)'}\n` +
      `       npm needs a trusted publisher matching those, plus the environment\n` +
      `       \`${TRUSTED_PUBLISHER.environment}\` this job runs in.\n`
  );

  const blocked = [];
  const unclear = [];

  for (const { name } of packages) {
    const result = await exchangeIsAllowed(idToken, name);

    if (result.ok) {
      process.stdout.write(`  ok       ${name}\n`);
      continue;
    }
    if (result.trustedPublisher) {
      blocked.push({ name, detail: result.detail });
      process.stdout.write(`  blocked  ${name} — ${result.detail}\n`);
      continue;
    }
    unclear.push({ name, detail: result.detail });
    process.stdout.write(`  unclear  ${name} — ${result.detail}\n`);
  }

  if (!blocked.length && !unclear.length) {
    process.stdout.write(
      `\nrelease: npm will trade this job's token for all ${packages.length} package(s),\n` +
        '         so Lerna will publish them with provenance.\n'
    );
    return true;
  }

  const [owner, repo] = TRUSTED_PUBLISHER.repository.split('/');

  const lines = [];
  if (blocked.length) {
    lines.push(
      `${blocked.length} package(s) have no trusted publisher for this build, so they`,
      `would go out unsigned and could never be attested afterwards:`,
      '',
      ...blocked.map(({ name }) => `  ${name}`),
      '',
      `That is unexpected: \`${TRUSTED_PUBLISHER.workflowFilename}\` is what publishes these`,
      'packages today, so each one should already carry a publisher for it. These',
      'either have none, or one naming a different file or environment.',
      '',
      'A package that has never been published from CI — a new one, or one that',
      'was always published by hand — has nothing to reuse, so it needs this form',
      'filled once before its first publish from here.',
      '',
      'npm has no CLI or API for this. On each package: npmjs.com → package →',
      'Access → Trusted Publisher → GitHub Actions, with',
      '',
      `      Organization or user   ${owner}`,
      `      Repository             ${repo}`,
      `      Workflow filename      ${TRUSTED_PUBLISHER.workflowFilename}`,
      `      Environment name       ${TRUSTED_PUBLISHER.environment}`,
      '',
      'The workflow filename is a filename, not a path: a path is accepted and',
      'then never matches, because npm only checks the form when you publish.',
      'An unused config expires after two days, so add them all and publish.',
      '',
      'To ship this train before that is sorted, re-run with --allow-unsigned:',
      'the other packages stay signed and these go out without an attestation,',
      'which is permanent — a published version can never be attested.'
    );
  }
  if (unclear.length) {
    lines.push(
      `${unclear.length} package(s) could not be checked:`,
      ...unclear.map(({ name, detail: why }) => `  ${name} — ${why}`)
    );
    if (fatal) {
      lines.push(
        '',
        'An exchange that did not answer is not an answer. Publishing now could',
        'put a version out with no provenance, which cannot be undone.'
      );
    }
  }

  // Fail closed. A package whose exchange never answered is as unsafe to
  // publish as one npm refused outright, so `fatal` stops for both.
  if (fatal && (blocked.length || unclear.length)) {
    fail(lines.join('\n'));
  }

  process.stdout.write(`\n${lines.join('\n')}\n`);

  return false;
}

/**
 * Read the attestations back from the registry. npm writes them as part of the
 * publish request, so one retry is belt and braces for read-after-write, not a
 * guess at a delay.
 */
async function readAttestations(name, version) {
  const url = new URL(
    `/-/npm/v1/attestations/${escapeName(name)}@${version}`,
    NPM_REGISTRY
  );

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      });

      if (response.status === 404) {
        return { count: 0 };
      }
      if (!response.ok) {
        return { detail: `HTTP ${response.status}` };
      }

      const body = await response.json();

      return { count: (body?.attestations ?? []).length };
    } catch (error) {
      if (attempt === 3) {
        return { detail: error.message };
      }
      sleep(2000);
    }
  }

  return { detail: 'unreachable' };
}

/**
 * The channel tags of a package, from the abbreviated metadata document. A plain
 * `npm dist-tag ls` works right up to the point Lerna has written the token it
 * traded for into `~/.npmrc` — and an expired one of those makes npm's own reads
 * fail, on a release that just succeeded. These two reads stay anonymous, so
 * they report on the registry rather than on a credential that is already gone.
 */
async function readDistTags(name) {
  try {
    const response = await fetch(`${NPM_REGISTRY}/${escapeName(name)}`, {
      headers: { accept: 'application/vnd.npm.install-v1+json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return { detail: `HTTP ${response.status}` };
    }

    return { tags: (await response.json())?.['dist-tags'] ?? {} };
  } catch (error) {
    return { detail: error.message };
  }
}

async function verifyPublished({ published, distTag, requireSigned }) {
  process.stdout.write(
    '\nrelease: reading the versions back from the registry…\n'
  );

  const unsigned = [];
  const unreadable = [];
  const mistagged = [];
  let attested = 0;

  for (const { name, version } of published) {
    const { count, detail } = await readAttestations(name, version);

    if (detail) {
      unreadable.push({ name, version, detail });
      process.stdout.write(`  unreadable  ${name}@${version} — ${detail}\n`);
      continue;
    }

    const { tags = {}, detail: tagDetail } = await readDistTags(name);
    const tagged = tagDetail ? undefined : tags[distTag];

    // Two independent checks. `--allow-unsigned` waives the attestation and
    // nothing else: a version that reached npm without landing on the channel
    // tag is a wrong release whether or not it is signed, and a tag read that
    // failed counts as unconfirmed rather than as fine.
    if (count === 0) {
      if (requireSigned) {
        unsigned.push({ name, version });
        process.stdout.write(`  UNSIGNED    ${name}@${version}\n`);
      } else {
        // The one case where no attestation is not a failure: the run said
        // `--allow-unsigned`, so there was nothing to sign with.
        process.stdout.write(
          `  unsigned    ${name}@${version} (expected: --allow-unsigned)\n`
        );
      }
    } else {
      attested += 1;
      process.stdout.write(`  signed      ${name}@${version}\n`);
    }

    if (tagged !== version) {
      mistagged.push({ name, version, tagged, detail: tagDetail });
      process.stdout.write(
        `  wrong tag   ${name}@${version} — \`${distTag}\` points at ${tagged || '(nowhere)'}${tagDetail ? ` (${tagDetail})` : ''}\n`
      );
    }
  }

  const lines = [];
  if (unsigned.length) {
    lines.push(
      'these versions reached npm without an attestation, and npm cannot attest a',
      'version after it exists. They stay unsigned. Publish the next prerelease',
      'from a job that passes --preflight, and tell people to install that one:',
      ...unsigned.map(({ name, version }) => `  ${name}@${version}`)
    );
  }
  if (mistagged.length) {
    lines.push(
      `these versions are on npm but not confirmed on \`${distTag}\`. Check with`,
      '`npm dist-tag ls <name>`, and move the tag if it really is elsewhere:',
      ...mistagged.map(
        ({ name, version, tagged, detail }) =>
          `  ${name}@${version} — \`${distTag}\` is at ${tagged || '(nowhere)'}${
            detail ? ` (tag unreadable: ${detail})` : ''
          }`
      )
    );
  }
  if (unreadable.length) {
    lines.push(
      'the registry could not be read for these; check them by hand:',
      ...unreadable.map(
        ({ name, version, detail }) => `  ${name}@${version} — ${detail}`
      )
    );
  }

  if (lines.length) {
    // The versions are out. Nothing here can take them back, so the job just
    // has to say so in a way that turns the run red.
    fail(lines.join('\n'));
  }

  // A count, not a yes/no: `--allow-unsigned` skips the exchange for every
  // package, but Lerna still signs the ones it can, so a run can end mixed.
  process.stdout.write(
    `\nrelease: ${published.length} package(s) on \`${distTag}\`, ` +
      `${attested} of ${published.length} attested.\n`
  );
}

/* eslint-enable no-await-in-loop */

const options = parseArgs(process.argv.slice(2));
const distTag = CHANNELS[options.channel];

const branch = assertCleanBranch();
const packages = readPackages();

process.stdout.write(
  `release: ${packages.length} public package(s) on \`${branch}\`, ` +
    `channel \`${options.channel}\` → \`${distTag}\`, mode \`${options.mode}\``
);

if (options.mode === 'preflight') {
  await preflight({
    packages,
    // A preflight is only interesting in CI, where the publish path insists on
    // it too. Locally it reports and exits 0, so it can be run by hand.
    fatal: Boolean(process.env.GITHUB_ACTIONS) && !options.unsigned,
  });
  process.exit(0);
}

const wantsProvenance = !options.unsigned;

if (options.mode === 'publish') {
  if (!process.env.GITHUB_ACTIONS) {
    if (!wantsProvenance) {
      process.stdout.write(
        '\nrelease: --allow-unsigned outside CI: these versions will never be attested.\n'
      );
    } else {
      fail(
        [
          'outside GitHub Actions there is no OIDC token, so this publish would be',
          'unsigned — and a version can never be attested afterwards.',
          'Run the `prerelease` job in .github/workflows/ci.yml, or pass',
          '--allow-unsigned to publish unsigned from here.',
        ].join('\n')
      );
    }
  }

  // Before anything is written. Once the bump is committed and tagged, the
  // branch has spent `5.0.0-beta.0`: npm will not take the version back, and the
  // tags that name it would have to be reset by hand for the next attempt.
  if (wantsProvenance) {
    await preflight({ packages, fatal: true });
  }
}

// The same command in every mode, and the same one `ship.config.mjs` runs for a
// stable release. `--no-git-tag-version --no-push` is the point: the commit and
// the tags have to come *after* `yarn test:versions --fix` below, because that
// fix-up can move a package's version. Letting Lerna commit and tag first would
// leave tags naming versions that were never published.
const versionArgs = [
  'lerna',
  'version',
  '--exact',
  '--conventional-commits',
  '--yes',
  '--conventional-prerelease',
  '--preid',
  options.channel,
  '--no-git-tag-version',
  '--no-push',
];

// Every mode computes the versions in a throwaway pass first, so the guards
// below run against real numbers while the branch is still untouched — and it
// runs the fix-up too, so the table says what a publish would actually land.
// Publish then repeats these two steps for real, from the same commit.
const planArgs = [...versionArgs, '--no-changelog'];

// A signal would otherwise leave the rewritten manifests on disk: Ctrl-C exits
// through neither `fail()` nor the plan's own restore, and the next run then
// stops at the clean-tree check. Restoring here is safe because a handler only
// runs once `spawnSync` has returned — the child is in the same process group
// and takes the signal too — so nothing is still writing while the tree goes
// back. Once the plan's edits are gone `restoreWorkingTree()` does nothing, so
// an interrupted publish keeps its uncommitted bump for whoever ran it.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    restoreWorkingTree();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  });
}

planEditsOnDisk = true;
run('yarn', planArgs);
run('yarn', ['test:versions', '--fix']);

const planned = readPackages();
const table = formatTable(packages, planned);
process.stdout.write(`\n${table}\n`);
summarize(
  `### Release ${options.channel} (${options.mode}) from \`${branch}\`\n\n${table}\n`
);

// `from-package` publishes exactly the versions the registry does not have yet,
// which is not the same set as the versions Lerna just bumped: a package with no
// commits since the last release keeps its published version and is skipped.
const willPublish = planned.filter(
  ({ name, version }) => !isPublished(name, version)
);

if (!willPublish.length) {
  fail(
    'nothing to publish; no package has a version the registry does not already have'
  );
}

process.stdout.write(
  `\nWould publish ${willPublish.length} package(s) to \`${distTag}\`:\n`
);
for (const { name, version } of willPublish) {
  process.stdout.write(`  ${name}@${version}\n`);
}

// Two invariants, both about the tag rather than the versions: nothing here may
// move `latest`, and everything that goes out must name the channel it is being
// published under. A package that already carries another preid keeps it —
// `--pre-dist-tag` would otherwise put `next` on a `-beta.` version.
const offChannel = willPublish.filter(
  ({ version }) => !matchesChannel(version, options.channel)
);
if (offChannel.length) {
  fail(
    [
      `these versions must not go out under the \`${distTag}\` dist-tag:`,
      ...offChannel.map(({ name, version }) => `  ${name}@${version}`),
      '',
      'A package that already carries another preid keeps it. Release it on the',
      'channel its version already names.',
      '',
      `If it should graduate instead, merge the branch into \`master\` and let Ship.js`,
      'publish it as `latest` from there — that is the flow with a review step.',
    ].join('\n')
  );
}

if (
  distTag === 'latest' ||
  willPublish.some(({ version }) => !isPrerelease(version))
) {
  fail(
    'refusing to publish a stable version: this script only moves a channel tag'
  );
}

// Each package's own `version` lifecycle rewrites its version file
// (`src/version.ts` and friends), and the react flavor has to stay in sync
// across its three packages; `yarn test:versions --fix` just ran both. This
// re-reads the result. If it still disagrees, the table above is not what a
// publish would land, and publishing something the plan did not show is exactly
// what this script exists to prevent — so it stops here, in plan mode too.
if (run('yarn', ['test:versions'], { allowFail: true }) !== 0) {
  fail(
    [
      '`yarn test:versions` still reports a mismatch after its own --fix pass,',
      'so the versions above are not what a publish would land.',
      '',
      'tests/versions/index.js says which group or version file disagrees; the',
      'usual cause is a package that should have joined this train, or a version',
      'file that nothing regenerates any more. Fix that, then re-run.',
    ].join('\n')
  );
}

restoreWorkingTree();

if (options.mode === 'plan') {
  process.stdout.write(
    '\nrelease: plan only — nothing was committed, tagged, pushed or published,\n' +
      '         and the tree is restored.\n'
  );
  process.exit(0);
}

if (!options.yes) {
  confirm({
    branch,
    channel: options.channel,
    packages: willPublish,
    distTag,
  });
}

// The real pass: the two steps the plan just ran, in the same order, still
// without touching git — the commit and the tags come after them, not between.
run('yarn', versionArgs);
run('yarn', ['test:versions', '--fix']);

// The bump rewrote every workspace range to the new versions, so the lockfile
// has to agree before it reaches anyone else's `yarn install --frozen-lockfile`.
run('yarn', ['install', '--mode=update-lockfile']);

// The real pass has to land on the versions that were just checked and approved.
const actual = new Map(
  readPackages().map(({ name, version }) => [name, version])
);
const drifted = willPublish.filter(
  ({ name, version }) => actual.get(name) !== version
);
if (drifted.length) {
  fail(
    [
      'the version pass produced different versions than the plan above; nothing was committed, tagged, pushed or published:',
      ...drifted.map(
        ({ name, version }) =>
          `  ${name} planned ${version}, got ${actual.get(name)}`
      ),
      '',
      'Something landed on the branch mid-run. Nothing has left this machine,',
      'so the fix is to re-run once the branch settles.',
    ].join('\n')
  );
}

// One commit, then the tags: the numbers that survived the fix-up are what the
// tags name, so a tag can never point at a version the tree it marks does not
// carry. It has to be committed anyway — `lerna publish` refuses a dirty tree
// (EPristine) — and `--update` keeps it to tracked files, so a stray untracked
// file cannot ride along into a release commit.
const bump = capture('git', ['status', '--porcelain', '--untracked-files=no']);
if (!bump) {
  fail('the version pass changed nothing on disk, so there is nothing to tag');
}
process.stdout.write(`\nrelease: committing the bump:\n${bump}\n`);
run('git', ['add', '--update']);
// `chore(release):` rather than `chore: release` on purpose: `ci.yml` reads a
// subject starting with `chore: release` on `master` as Ship.js's own release
// commit, and this bump is deliberately not one.
run('git', ['commit', '-m', `chore(release): publish ${options.channel}`]);

// Annotated, on purpose: `git push --follow-tags` below carries annotated tags
// and skips lightweight ones, and annotated `name@version` tags are what a
// Ship.js release leaves behind — which matters, because the next
// `lerna version` reads those names to find where this train starts.
for (const { name, version } of planned) {
  if (capture('git', ['tag', '-l', `${name}@${version}`])) {
    // Already tagged: this package kept the version it published last time.
    continue;
  }
  run('git', [
    'tag',
    '--annotate',
    '--message',
    `${name}@${version}`,
    `${name}@${version}`,
  ]);
}

run('git', ['push', '--follow-tags', 'origin', `HEAD:${branch}`]);

process.stdout.write('\nrelease: bump commit and tags pushed.\n');

// The same build CI runs and the same one the stable release uses.
run('yarn', ['build:ci'], { env: { NODE_ENV: 'production' } });

// One package at a time: concurrent provenance uploads make Rekor time out, and
// the retried upload then fails with a 409 (see ship.config.mjs).
const publishArgs = [
  'lerna',
  'publish',
  'from-package',
  '--yes',
  '--concurrency',
  '1',
  // Applies to prerelease versions only. Every version in this train is one —
  // the guard above refuses anything else — so this is the only tag a publish
  // from here can move, and `latest` keeps pointing at the last stable release
  // however many betas go out.
  '--pre-dist-tag',
  distTag,
];

run('yarn', publishArgs);

for (const { name, version } of willPublish) {
  summarize(`- \`${name}@${version}\` → \`npm install ${name}@${distTag}\`\n`);
}

await verifyPublished({
  published: willPublish,
  distTag,
  requireSigned: wantsProvenance,
});
