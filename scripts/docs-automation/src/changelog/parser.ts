import * as fs from 'node:fs';
import * as path from 'node:path';

import type { ChangeEntry, ChangeType, Release } from '../types';

/**
 * Parses a CHANGELOG.md file and extracts releases with their changes.
 * Supports the conventional commits format used in InstantSearch.
 */
export function parseChangelog(changelogPath: string): Release[] {
  const content = fs.readFileSync(changelogPath, 'utf-8');
  const packageName = extractPackageName(changelogPath);
  return parseChangelogContent(content, packageName);
}

/**
 * Extracts the package name from the CHANGELOG path.
 * e.g., packages/instantsearch.js/CHANGELOG.md -> instantsearch.js
 */
function extractPackageName(changelogPath: string): string {
  const parts = changelogPath.split(path.sep);
  const packagesIndex = parts.indexOf('packages');
  if (packagesIndex !== -1 && parts[packagesIndex + 1]) {
    return parts[packagesIndex + 1];
  }
  return 'unknown';
}

/**
 * Parses the changelog content string into structured Release objects.
 */
export function parseChangelogContent(
  content: string,
  packageName: string
): Release[] {
  const releases: Release[] = [];
  const lines = content.split('\n');

  let currentRelease: Release | null = null;
  let currentSection: ChangeType | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match version headers: ## [4.87.0] or # [4.87.0]
    const versionMatch = line.match(
      /^##?\s+\[?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)\]?(?:\s*\(([^)]+)\))?/
    );
    if (versionMatch) {
      // Save previous release if exists
      if (currentRelease) {
        releases.push(currentRelease);
      }

      const version = versionMatch[1];
      const compareUrl = extractCompareUrl(line);
      const date = extractDate(lines, i);

      currentRelease = {
        version,
        date,
        packageName,
        changes: [],
        compareUrl,
      };
      currentSection = null;
      continue;
    }

    // Match section headers: ### Bug Fixes, ### Features, etc.
    const sectionMatch = line.match(/^###\s+(.+)/);
    if (sectionMatch && currentRelease) {
      currentSection = mapSectionToChangeType(sectionMatch[1]);
      continue;
    }

    // Match change entries: * **scope:** description ([#123](...)) ([hash](...))
    // Format: bullet point, optional scope in **scope:** format, description with links
    if (line.startsWith('* ') && currentRelease && currentSection) {
      let remaining = line.slice(2); // Remove "* "

      // Extract scope: **scope:** format (bold text ending with colon)
      let scope: string | undefined;
      const scopeMatch = remaining.match(/^\*\*([^:*]+):\*\*\s+/);
      if (scopeMatch) {
        scope = scopeMatch[1];
        remaining = remaining.slice(scopeMatch[0].length);
      }

      // Extract PR number: ([#123](...)) format
      let prNumber: number | undefined;
      const prMatch = remaining.match(/\(\[#(\d+)\]/);
      if (prMatch) {
        prNumber = parseInt(prMatch[1], 10);
      }

      // Extract commit hash: ([hash](...)) at the end
      let commitHash: string | undefined;
      const hashMatch = remaining.match(/\(\[([a-f0-9]+)\]\([^)]+\)\)$/);
      if (hashMatch) {
        commitHash = hashMatch[1];
      }

      const description = remaining;

      // Check for breaking change indicator
      const isBreaking =
        description.includes('BREAKING CHANGE') ||
        line.includes('BREAKING CHANGE') ||
        currentSection === 'breaking';

      const changeEntry: ChangeEntry = {
        type: currentSection,
        scope: scope?.trim(),
        description: cleanDescription(description),
        prNumber,
        commitHash: commitHash?.trim(),
        isBreaking,
      };

      currentRelease.changes.push(changeEntry);
    }

    // Match BREAKING CHANGES section content
    if (
      line.match(/^###\s+BREAKING\s+CHANGES?/i) ||
      line.match(/^\*\s+BREAKING\s+CHANGE/i)
    ) {
      currentSection = 'breaking';
    }
  }

  // Don't forget the last release
  if (currentRelease) {
    releases.push(currentRelease);
  }

  return releases;
}

/**
 * Maps section header text to a ChangeType.
 */
function mapSectionToChangeType(section: string): ChangeType {
  const normalizedSection = section.toLowerCase().trim();

  if (normalizedSection.includes('feature')) return 'feature';
  if (
    normalizedSection.includes('bug fix') ||
    normalizedSection.includes('fix')
  )
    return 'fix';
  if (normalizedSection.includes('breaking')) return 'breaking';
  if (normalizedSection.includes('deprecat')) return 'deprecation';
  if (normalizedSection.includes('refactor')) return 'refactor';
  if (
    normalizedSection.includes('doc') ||
    normalizedSection.includes('documentation')
  )
    return 'docs';
  if (normalizedSection.includes('revert')) return 'revert';
  if (
    normalizedSection.includes('chore') ||
    normalizedSection.includes('build') ||
    normalizedSection.includes('ci')
  )
    return 'chore';

  return 'chore';
}

/**
 * Extracts the compare URL from a version line.
 */
function extractCompareUrl(line: string): string | undefined {
  const urlMatch = line.match(/\(https:\/\/github\.com\/[^)]+\)/);
  if (urlMatch) {
    return urlMatch[0].slice(1, -1); // Remove parentheses
  }
  return undefined;
}

/**
 * Extracts the date from lines near the version header.
 */
function extractDate(
  lines: string[],
  versionLineIndex: number
): string | undefined {
  // Look at the same line and a few lines after for the date
  for (
    let i = versionLineIndex;
    i < Math.min(versionLineIndex + 3, lines.length);
    i++
  ) {
    const dateMatch = lines[i].match(/\((\d{4}-\d{2}-\d{2})\)/);
    if (dateMatch) {
      return dateMatch[1];
    }
  }
  return undefined;
}

/**
 * Cleans up the description by removing common artifacts.
 */
function cleanDescription(description: string): string {
  return description
    .replace(/\s*\(\[[\da-f]+\]\([^)]+\)\)$/, '') // Remove commit hash links
    .replace(/\s*,\s*closes\s+#\d+/gi, '') // Remove "closes #123"
    .replace(/\s*\(#\d+\)$/, '') // Remove trailing PR numbers
    .trim();
}

/**
 * Gets the latest release from a changelog.
 * Optionally skips releases with no changes (version bumps only).
 */
export function getLatestRelease(
  releases: Release[],
  options?: { skipEmpty?: boolean }
): Release | undefined {
  if (options?.skipEmpty) {
    return releases.find((r) => r.changes.length > 0);
  }
  return releases[0];
}

/**
 * Gets releases between two versions (inclusive).
 */
export function getReleasesBetween(
  releases: Release[],
  fromVersion: string,
  toVersion: string
): Release[] {
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < releases.length; i++) {
    if (releases[i].version === toVersion) {
      startIndex = i;
    }
    if (releases[i].version === fromVersion) {
      endIndex = i;
      break;
    }
  }

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  return releases.slice(startIndex, endIndex + 1);
}

/**
 * Parses all CHANGELOGs in the packages directory.
 */
export function parseAllChangelogs(
  packagesDir: string
): Map<string, Release[]> {
  const result = new Map<string, Release[]>();

  const packageDirs = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const packageDir of packageDirs) {
    const changelogPath = path.join(packagesDir, packageDir, 'CHANGELOG.md');
    if (fs.existsSync(changelogPath)) {
      const releases = parseChangelog(changelogPath);
      result.set(packageDir, releases);
    }
  }

  return result;
}
