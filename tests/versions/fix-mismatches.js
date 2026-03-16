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

function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

function getToday() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function readPackageJson(name) {
  const filePath = path.join(PACKAGES_DIR, name, 'package.json');
  return { filePath, data: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
}

function writePackageJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function insertChangelogEntry(name, oldVersion, newVersion) {
  const changelogPath = path.join(PACKAGES_DIR, name, 'CHANGELOG.md');
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

function updateDependencyReferences(packageName, newVersion) {
  const depKeys = ['dependencies', 'devDependencies', 'peerDependencies'];
  const packageJsonFiles = [
    ...findPackageJsonFiles(PACKAGES_DIR),
    ...findPackageJsonFiles(EXAMPLES_DIR),
  ];

  packageJsonFiles.forEach((filePath) => {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = false;

    depKeys.forEach((key) => {
      if (
        data[key] &&
        data[key][packageName] &&
        data[key][packageName] !== newVersion
      ) {
        console.log(
          `  Updating ${packageName} dependency in ${path.relative(
            ROOT_DIR,
            filePath
          )}: ${data[key][packageName]} -> ${newVersion}`
        );
        data[key][packageName] = newVersion;
        changed = true;
      }
    });

    if (changed) {
      writePackageJson(filePath, data);
    }
  });
}

function fixMismatches() {
  // Fix group version mismatches
  for (const [group, packages] of Object.entries(PACKAGE_GROUPS)) {
    const packageVersions = packages.map((name) => {
      const { filePath, data } = readPackageJson(name);
      return { name, filePath, data, version: data.version };
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

        pkg.data.version = highestVersion;
        writePackageJson(pkg.filePath, pkg.data);

        if (insertChangelogEntry(pkg.name, pkg.version, highestVersion)) {
          console.log(`  Updated CHANGELOG.md`);
        }

        updateDependencyReferences(pkg.name, highestVersion);
      });
  }

  // Fix version file mismatches
  for (const { name, versionFile, format } of VERSION_FILES) {
    const { data } = readPackageJson(name);
    const version = data.version;
    const filePath = path.join(PACKAGES_DIR, name, versionFile);

    const expected = buildVersionFileContent(version, format);
    const actual = fs.readFileSync(filePath, 'utf8');

    if (actual !== expected) {
      console.log(`Fixing version file: ${name}/${versionFile}`);
      fs.writeFileSync(filePath, expected);
    }
  }
}

module.exports = { fixMismatches };
