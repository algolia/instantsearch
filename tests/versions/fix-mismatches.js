/* eslint-disable no-console, import/no-commonjs */
const fs = require('fs');
const path = require('path');

const {
  PACKAGE_GROUPS,
  VERSION_FILES,
  buildVersionFileContent,
} = require('./shared');

const ROOT_DIR = path.join(__dirname, '../..');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const EXAMPLES_DIR = path.join(ROOT_DIR, 'examples');

function splitSemver(version) {
  const dash = version.indexOf('-');
  if (dash === -1) {
    return [version.split('.').map(Number), ''];
  }
  return [
    version.slice(0, dash).split('.').map(Number),
    version.slice(dash + 1),
  ];
}

// The ordering a prerelease needs: it sorts below the release it leads up to,
// its identifiers compare numerically when they are all digits, numeric
// identifiers rank below alphanumeric ones, and a longer list wins when the
// shared prefix is equal. Without this, `8.0.0-beta.0` and `8.0.0-beta.2` read
// as equal and syncing a group pulls the higher prerelease down.
function comparePrerelease(a, b) {
  if (a === b) return 0;
  if (a === '') return 1;
  if (b === '') return -1;

  const ia = a.split('.');
  const ib = b.split('.');
  for (let i = 0; i < Math.max(ia.length, ib.length); i++) {
    const x = ia[i];
    const y = ib[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;

    const nx = /^\d+$/.test(x) ? Number(x) : undefined;
    const ny = /^\d+$/.test(y) ? Number(y) : undefined;
    if (nx !== undefined && ny !== undefined) {
      if (nx !== ny) return nx > ny ? 1 : -1;
      continue;
    }
    if (nx !== undefined) return -1;
    if (ny !== undefined) return 1;
    if (x !== y) return x > y ? 1 : -1;
  }
  return 0;
}

function compareSemver(a, b) {
  const [coreA, preA] = splitSemver(a);
  const [coreB, preB] = splitSemver(b);
  for (let i = 0; i < 3; i++) {
    if (coreA[i] > coreB[i]) return 1;
    if (coreA[i] < coreB[i]) return -1;
  }
  return comparePrerelease(preA, preB);
}

function getToday() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function insertChangelogEntry(packagesDir, name, oldVersion, newVersion) {
  const changelogPath = path.join(packagesDir, name, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    return false;
  }

  const content = fs.readFileSync(changelogPath, 'utf8');
  const entry = [
    `## [${newVersion}](https://github.com/algolia/instantsearch/compare/${name}@${oldVersion}...${name}@${newVersion}) (${getToday()})`,
    '',
    `**Note:** Version bump only for package ${name}`,
    '',
    '',
    '',
    '',
  ].join('\n');

  // Insert the new entry before the first ## heading (the previous version)
  const firstHeadingIndex = content.indexOf('\n## ');
  if (firstHeadingIndex === -1) {
    // No existing version entries — append after the header
    fs.writeFileSync(changelogPath, `${content.trimEnd()}\n\n${entry}\n`);
  } else {
    const before = content.slice(0, firstHeadingIndex + 1);
    const after = content.slice(firstHeadingIndex + 1);
    fs.writeFileSync(changelogPath, before + entry + after);
  }

  return true;
}

function findPackageJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') {
      // eslint-disable-next-line no-continue
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPackageJsonFiles(fullPath));
    } else if (entry.name === 'package.json') {
      results.push(fullPath);
    }
  }
  return results;
}

function updateDependencyReferences(
  rootDir,
  packagesDir,
  examplesDir,
  packageName,
  newVersion
) {
  const depKeys = ['dependencies', 'devDependencies', 'peerDependencies'];
  const packageJsonFiles = [
    ...findPackageJsonFiles(packagesDir),
    ...findPackageJsonFiles(examplesDir),
  ];

  packageJsonFiles.forEach((filePath) => {
    const data = readJson(filePath);
    let changed = false;

    depKeys.forEach((key) => {
      if (
        data[key] &&
        data[key][packageName] &&
        data[key][packageName] !== newVersion
      ) {
        console.log(
          `  Updating ${packageName} dependency in ${path.relative(
            rootDir,
            filePath
          )}: ${data[key][packageName]} -> ${newVersion}`
        );
        data[key][packageName] = newVersion;
        changed = true;
      }
    });

    if (changed) {
      writeJson(filePath, data);
    }
  });
}

function fixMismatchesIn(
  packageGroups,
  versionFiles,
  { rootDir, packagesDir, examplesDir }
) {
  // Fix group version mismatches
  for (const [group, packages] of Object.entries(packageGroups)) {
    const packageVersions = packages.map((name) => {
      const filePath = path.join(packagesDir, name, 'package.json');
      return { name, filePath, version: readJson(filePath).version };
    });

    const highestVersion = packageVersions.reduce(
      (max, { version }) => (compareSemver(version, max) > 0 ? version : max),
      packageVersions[0].version
    );

    packageVersions
      .filter((pkg) => pkg.version !== highestVersion)
      .forEach((pkg) => {
        console.log(
          `[${group}] Bumping ${pkg.name}: ${pkg.version} -> ${highestVersion}`
        );

        // Re-read the file: `updateDependencyReferences` below may have
        // rewritten it in an earlier iteration, and writing back a snapshot
        // taken before that would clobber the dependency it just fixed.
        const data = readJson(pkg.filePath);
        data.version = highestVersion;
        writeJson(pkg.filePath, data);

        if (
          insertChangelogEntry(
            packagesDir,
            pkg.name,
            pkg.version,
            highestVersion
          )
        ) {
          console.log(`  Updated CHANGELOG.md`);
        }

        updateDependencyReferences(
          rootDir,
          packagesDir,
          examplesDir,
          pkg.name,
          highestVersion
        );
      });
  }

  // Fix version file mismatches
  for (const { name, versionFile, format } of versionFiles) {
    const filePath = path.join(packagesDir, name, versionFile);
    const pkgPath = path.join(packagesDir, name, 'package.json');
    const { version } = readJson(pkgPath);

    const expected = buildVersionFileContent(version, format);
    const actual = fs.readFileSync(filePath, 'utf8');

    if (actual !== expected) {
      console.log(`Fixing version file: ${name}/${versionFile}`);
      fs.writeFileSync(filePath, expected);
    }
  }
}

function fixMismatches() {
  fixMismatchesIn(PACKAGE_GROUPS, VERSION_FILES, {
    rootDir: ROOT_DIR,
    packagesDir: PACKAGES_DIR,
    examplesDir: EXAMPLES_DIR,
  });
}

module.exports = { fixMismatches, fixMismatchesIn };
