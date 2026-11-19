import shell from 'shelljs';
import { getChangelog } from 'shipjs/src/helper/index.js';

const packages = JSON.parse(
  shell.exec('yarn run --silent lerna list --toposort --json', {
    silent: true,
  })
);
const changedPackages = packages
  .map((pkg) => ({
    ...pkg,
    isPublished: Boolean(
      shell.exec(`git tag -l ${pkg.name}@${pkg.version}`, {
        silent: true,
      }).stdout
    ),
  }))
  .filter(({ isPublished }) => !isPublished);
let updatedPackages = [];
let previousVersions = new Map();

// The npm dist-tag for stable versions released from this branch. `latest` on
// `master`. On a maintenance branch of an older major (e.g. `v4`), set it to
// that major (`v4`) once the next major is out: Ship.js refuses to move
// `latest` back to an older version, so forgetting this fails the release
// instead of taking `latest` away from the current major.
const STABLE_DIST_TAG = 'latest';

const isPrerelease = (version) => version.includes('-');

export default {
  shouldPrepare: () => {
    return true;
  },
  getTagName: () => changedPackages.map((pkg) => `${pkg.name}@${pkg.version}`),
  getStagingBranchName: () => `chore/release-${Date.now()}`,
  // `prerelease` is `{ preid }` for `shipjs prepare --preid <channel>`.
  version({ exec, prerelease }) {
    const prereleased = packages.filter(({ version }) => isPrerelease(version));
    if (
      !prerelease &&
      prereleased.length > 0 &&
      process.env.SHIPJS_ALLOW_GRADUATE !== 'true'
    ) {
      // Without a channel, `--conventional-graduate` below turns every
      // prerelease into its stable version: only on purpose.
      throw new Error(
        [
          'These packages are on a prerelease, and a stable release would graduate them:',
          ...prereleased.map(({ name, version }) => `  ${name}@${version}`),
          'Prepare with `--preid <channel>` to continue the prerelease, or set SHIPJS_ALLOW_GRADUATE=true to graduate.',
        ].join('\n')
      );
    }
    const flags = prerelease
      ? // Every changed package goes to `<x.y.z>-<preid>.N`.
        `--conventional-prerelease --preid ${prerelease.preid}`
      : // A package last released as a prerelease goes stable even without a
        // commit since; without this flag Lerna would leave it on the prerelease.
        '--conventional-graduate';
    exec(
      `yarn lerna version --no-git-tag-version --no-push --exact --conventional-commits ${flags} --yes`
    );

    const packageVersionsAfterUpdate = JSON.parse(
      shell.exec('yarn run --silent lerna list --toposort --json', {
        silent: true,
      })
    );
    previousVersions = new Map(
      packages.map(({ name, version }) => [name, version])
    );
    updatedPackages = packageVersionsAfterUpdate.filter(
      ({ name, version }) => previousVersions.get(name) !== version
    );

    return {
      // Ship.js only uses this for the release type in the pull request (and
      // `shouldPrepare` is not called with a `version` hook), so any updated
      // package does. See https://github.com/algolia/shipjs/issues/986.
      nextVersion: (updatedPackages[0] || packages[0]).version,
    };
  },
  // The stable title must stay a prefix of the prerelease one: `shipjs trigger`
  // and `release-if-needed` in ci.yml check that the commit starts with it.
  formatCommitMessage: ({ prerelease }) =>
    prerelease ? `chore: release (${prerelease.preid})` : `chore: release`,
  formatPullRequestTitle: ({ prerelease }) =>
    prerelease ? `chore: release (${prerelease.preid})` : `chore: release`,
  formatPullRequestMessage: ({
    repo,
    repoURL,
    stagingBranch,
    releaseType,
    publishCommands,
    title,
  }) => {
    const repoLink = `[${repo}](${repoURL})`;
    // this is assuming there's a single "previous" version, so can't be used with independent versioning.
    // const diffLink = `[\`${currentVersion}\` → \`${nextVersion}\`](${diffURL})`;
    const publishCommandsTable = `\`\`\`${publishCommands}\`\`\``;
    const updatedPackagesSummary = updatedPackages.length
      ? [
          '| Package | Current Version | Next Version |',
          '|---|---|---|',
          ...updatedPackages.map(
            ({ name, version }) =>
              `| \`${name}\` | \`${previousVersions.get(name)}\` | \`${version}\` |`
          ),
        ].join('\n')
      : 'No package versions changed.';

    const mergeInstruction = `
When merging this pull request, you need to **Squash and merge** and make sure that the title starts with \`${title}\`.
<details>
<summary>See details</summary>

After that, a commit \`${title}\` will be added and you or your CI can run \`shipjs trigger\` to trigger the release based on the commit.
![Squash and merge](https://raw.githubusercontent.com/algolia/shipjs/v0.24.4/assets/squash-and-merge.png)
</details>
    `.trim();

    const message = `
This pull request prepares the following release:
| Repository | Branch | Update |
|---|---|---|
| ${repoLink} | ${stagingBranch} | ${releaseType} |

### Release Summary
The following packages have been updated:

${updatedPackagesSummary}

This is going to be published with the following command:

${publishCommandsTable}

### Merging Instructions
${mergeInstruction}

---

_This pull request is automatically generated by [Ship.js](https://github.com/algolia/shipjs)_.
`.trim();
    return message;
  },
  // TODO: restore once the frontend-experiences-bot app is granted (and the
  // org owner approves) the `Members: Read` permission it needs to resolve a
  // team. Without it the request-reviewers API returns 422 after the release
  // pull request is already created, failing the Prepare Release job.
  // pullRequestTeamReviewers: ['frontend-experiences-web'],
  buildCommand: () => 'NODE_ENV=production yarn build:ci',
  // What `shipjs trigger` publishes: the packages whose `name@version` tag does
  // not exist yet. Ship.js reads the prerelease channel from their versions.
  getPackagesToPublish: () =>
    changedPackages.map(({ name, version }) => ({ name, version })),
  // Stable versions go to `STABLE_DIST_TAG`, prerelease versions to their
  // channel (`5.0.0-beta.1` to `beta`). Ship.js refuses a prerelease on `latest`.
  getPublishTag: ({ prerelease }) => ({
    tag: STABLE_DIST_TAG,
    prereleaseTag: prerelease ? prerelease.preid : STABLE_DIST_TAG,
  }),
  // One package at a time: concurrent provenance uploads make Rekor time out,
  // and the retried upload then fails with a 409. sigstore is patched to fetch
  // the existing entry on a 409; this keeps the retries rare in the first place.
  // `from-package` skips versions already on npm, so re-running a release whose
  // publish failed halfway publishes the rest.
  publishCommand: ({ tag, prereleaseTag = tag }) =>
    `yarn lerna publish from-package --yes --concurrency 1 --dist-tag ${tag} --pre-dist-tag ${prereleaseTag}`,
  useOidcTokenProvider: true,
  beforeCommitChanges() {
    shell.exec('yarn test:versions --fix');
    const lockfileUpdate = shell.exec('yarn install --mode=update-lockfile');
    if (lockfileUpdate.code !== 0) {
      process.exit(lockfileUpdate.code);
    }
    shell.exec('yarn run doctoc');
  },
  releases: {
    extractChangelog: ({ tagName }) => {
      const pkg = changedPackages.find(
        ({ name, version }) => tagName === `${name}@${version}`
      );
      if (!pkg) {
        return '';
      }

      return getChangelog({ version: pkg.version, dir: pkg.location });
    },
  },
  slack: {
    // disable slack notification for `prepared` lifecycle.
    // Ship.js will send slack message only for `releaseSuccess`.
    prepared: null,
    releaseSuccess: ({
      appName,
      tagName,
      latestCommitHash,
      latestCommitUrl,
      repoURL,
    }) => ({
      pretext: `:tada: Successfully released *${appName}*`,
      fields: [
        {
          title: 'Branch',
          value: process.env.GITHUB_REF_NAME || 'master',
          short: true,
        },
        {
          title: 'Commit',
          value: `*<${latestCommitUrl}|${latestCommitHash}>*`,
          short: true,
        },
        {
          title: 'Versions',
          value: tagName,
        },
        {
          title: 'Releases',
          value: `${repoURL}/releases`,
        },
      ],
    }),
  },
};
