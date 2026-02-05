#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  parseAllChangelogs,
  parseChangelog,
  classifyChanges,
  getLatestRelease,
} from './changelog/index';

import type { CLIOptions, ChangeEntry, DocumentationNeed } from './types';

/**
 * Represents a released package detected from the release commit.
 */
interface ReleasedPackage {
  name: string;
  version: string;
  need: DocumentationNeed;
}

/**
 * Parses command line arguments.
 */
function parseArgs(): { command: string; options: CLIOptions } {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options: CLIOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
  };

  // Parse named arguments
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--package' && args[i + 1]) {
      options.package = args[i + 1];
      i++;
    } else if (args[i] === '--version' && args[i + 1]) {
      options.version = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    }
  }

  return { command, options };
}

/**
 * Gets the root directory of the InstantSearch repo.
 */
function getRepoRoot(): string {
  let dir = process.cwd();
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, 'packages', 'instantsearch.js'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

/**
 * Maps package names to their documentation flavor suffix.
 */
const PACKAGE_TO_FLAVOR: Record<string, string> = {
  'instantsearch.js': 'js',
  'react-instantsearch': 'react',
  'vue-instantsearch': 'vue',
};

/**
 * Main packages that have widget/hook documentation.
 * Other packages (core, helpers, css, etc.) don't need separate widget docs.
 */
const MAIN_DOC_PACKAGES = [
  'instantsearch.js',
  'react-instantsearch',
  'vue-instantsearch',
];

/**
 * Gets the flavor for a package name.
 */
function getPackageFlavor(packageName: string): string {
  return PACKAGE_TO_FLAVOR[packageName] || 'js';
}

/**
 * Checks if a package is a main documentation package.
 */
function isMainDocPackage(packageName: string): boolean {
  return MAIN_DOC_PACKAGES.includes(packageName);
}

/**
 * Categorizes changes for prompt generation.
 */
function categorizeChanges(changes: ChangeEntry[]): {
  newWidgets: ChangeEntry[];
  newConnectors: ChangeEntry[];
  newHooks: ChangeEntry[];
  modifiedComponents: ChangeEntry[];
  breakingChanges: ChangeEntry[];
  deprecations: ChangeEntry[];
} {
  const newWidgets = changes.filter(
    (c) => c.type === 'feature' && isNewComponentChange(c, 'widget')
  );
  const newConnectors = changes.filter(
    (c) => c.type === 'feature' && isNewComponentChange(c, 'connector')
  );
  const newHooks = changes.filter(
    (c) => c.type === 'feature' && isNewComponentChange(c, 'hook')
  );
  const modifiedComponents = changes.filter(
    (c) => c.type === 'feature' && !isNewComponentChange(c, 'widget') && !isNewComponentChange(c, 'connector') && !isNewComponentChange(c, 'hook')
  );
  const breakingChanges = changes.filter((c) => c.type === 'breaking' || c.isBreaking);
  const deprecations = changes.filter((c) => c.type === 'deprecation');

  return { newWidgets, newConnectors, newHooks, modifiedComponents, breakingChanges, deprecations };
}

/**
 * Formats changes for a single package section in the prompt.
 */
function formatPackageChanges(
  packageName: string,
  version: string,
  changes: ChangeEntry[],
  priority: string,
  contentTypes: string[]
): string {
  const { newWidgets, newConnectors, newHooks, modifiedComponents, breakingChanges, deprecations } = categorizeChanges(changes);
  const flavor = getPackageFlavor(packageName);

  let section = `### ${packageName} v${version}

**Priority:** ${priority}
**Suggested content types:** ${contentTypes.join(', ')}
**Documentation flavor:** \`.${flavor}.mdx\` files

`;

  if (newWidgets.length > 0) {
    section += `#### New Widgets
${newWidgets.map((c) => `- **${c.scope || extractComponentName(c.description)}** - ${c.description}`).join('\n')}

`;
  }

  if (newConnectors.length > 0) {
    section += `#### New Connectors
${newConnectors.map((c) => `- **${c.scope || extractComponentName(c.description)}** - ${c.description}`).join('\n')}

`;
  }

  if (newHooks.length > 0) {
    section += `#### New Hooks
${newHooks.map((c) => `- **${c.scope || extractComponentName(c.description)}** - ${c.description}`).join('\n')}

`;
  }

  if (modifiedComponents.length > 0) {
    section += `#### Modified Components
${modifiedComponents.map((c) => `- **${c.scope || 'General'}** - ${c.description}`).join('\n')}

`;
  }

  if (breakingChanges.length > 0) {
    section += `#### Breaking Changes
${breakingChanges.map((c) => `- **${c.scope || 'General'}** - ${c.description}`).join('\n')}

`;
  }

  if (deprecations.length > 0) {
    section += `#### Deprecations
${deprecations.map((c) => `- **${c.scope || 'General'}** - ${c.description}`).join('\n')}

`;
  }

  section += `**Source Reference:**
- Changelog: https://github.com/algolia/instantsearch/blob/master/packages/${packageName}/CHANGELOG.md
- Source code: https://github.com/algolia/instantsearch/tree/master/packages/${packageName}/src

`;

  return section;
}

/**
 * Generates the prompt for Claude Code CLI (single package).
 */
function generateClaudePrompt(
  packageName: string,
  version: string,
  changes: ChangeEntry[],
  priority: string,
  contentTypes: string[]
): string {
  return generateMultiPackagePrompt([{
    name: packageName,
    version,
    need: {
      release: { version, packageName, changes, date: undefined },
      changes,
      priority: priority as 'high' | 'medium' | 'low' | 'none',
      suggestedContentTypes: contentTypes as any[],
    },
  }]);
}

/**
 * Represents a deduplicated component change with its applicable flavors.
 */
interface DeduplicatedChange {
  name: string;
  description: string;
  type: 'widget' | 'connector' | 'hook' | 'modified' | 'breaking' | 'deprecation';
  flavors: string[];
  prNumber?: number;
}

/**
 * Deduplicates changes across packages and groups by component.
 * Same widget appearing in multiple packages becomes one entry with multiple flavors.
 */
function deduplicateChanges(packages: ReleasedPackage[]): {
  newWidgets: DeduplicatedChange[];
  newConnectors: DeduplicatedChange[];
  newHooks: DeduplicatedChange[];
  modifiedComponents: DeduplicatedChange[];
  breakingChanges: DeduplicatedChange[];
  deprecations: DeduplicatedChange[];
} {
  const widgetMap = new Map<string, DeduplicatedChange>();
  const connectorMap = new Map<string, DeduplicatedChange>();
  const hookMap = new Map<string, DeduplicatedChange>();
  const modifiedMap = new Map<string, DeduplicatedChange>();
  const breakingMap = new Map<string, DeduplicatedChange>();
  const deprecationMap = new Map<string, DeduplicatedChange>();

  for (const pkg of packages) {
    const flavor = getPackageFlavor(pkg.name);
    const { newWidgets, newConnectors, newHooks, modifiedComponents, breakingChanges, deprecations } = categorizeChanges(pkg.need.changes);

    for (const change of newWidgets) {
      const key = change.scope || extractComponentName(change.description);
      const existing = widgetMap.get(key);
      if (existing) {
        if (!existing.flavors.includes(flavor)) existing.flavors.push(flavor);
      } else {
        widgetMap.set(key, {
          name: key,
          description: change.description,
          type: 'widget',
          flavors: [flavor],
          prNumber: change.prNumber,
        });
      }
    }

    for (const change of newConnectors) {
      const key = change.scope || extractComponentName(change.description);
      const existing = connectorMap.get(key);
      if (existing) {
        if (!existing.flavors.includes(flavor)) existing.flavors.push(flavor);
      } else {
        connectorMap.set(key, {
          name: key,
          description: change.description,
          type: 'connector',
          flavors: [flavor],
          prNumber: change.prNumber,
        });
      }
    }

    for (const change of newHooks) {
      const key = change.scope || extractComponentName(change.description);
      const existing = hookMap.get(key);
      if (existing) {
        if (!existing.flavors.includes(flavor)) existing.flavors.push(flavor);
      } else {
        hookMap.set(key, {
          name: key,
          description: change.description,
          type: 'hook',
          flavors: [flavor],
          prNumber: change.prNumber,
        });
      }
    }

    for (const change of modifiedComponents) {
      const key = `${change.scope || 'General'}-${change.description.slice(0, 50)}`;
      const existing = modifiedMap.get(key);
      if (existing) {
        if (!existing.flavors.includes(flavor)) existing.flavors.push(flavor);
      } else {
        modifiedMap.set(key, {
          name: change.scope || 'General',
          description: change.description,
          type: 'modified',
          flavors: [flavor],
          prNumber: change.prNumber,
        });
      }
    }

    for (const change of breakingChanges) {
      const key = `${change.scope || 'General'}-${change.description.slice(0, 50)}`;
      const existing = breakingMap.get(key);
      if (existing) {
        if (!existing.flavors.includes(flavor)) existing.flavors.push(flavor);
      } else {
        breakingMap.set(key, {
          name: change.scope || 'General',
          description: change.description,
          type: 'breaking',
          flavors: [flavor],
          prNumber: change.prNumber,
        });
      }
    }

    for (const change of deprecations) {
      const key = `${change.scope || 'General'}-${change.description.slice(0, 50)}`;
      const existing = deprecationMap.get(key);
      if (existing) {
        if (!existing.flavors.includes(flavor)) existing.flavors.push(flavor);
      } else {
        deprecationMap.set(key, {
          name: change.scope || 'General',
          description: change.description,
          type: 'deprecation',
          flavors: [flavor],
          prNumber: change.prNumber,
        });
      }
    }
  }

  return {
    newWidgets: Array.from(widgetMap.values()),
    newConnectors: Array.from(connectorMap.values()),
    newHooks: Array.from(hookMap.values()),
    modifiedComponents: Array.from(modifiedMap.values()),
    breakingChanges: Array.from(breakingMap.values()),
    deprecations: Array.from(deprecationMap.values()),
  };
}

/**
 * Formats a deduplicated change for the prompt.
 */
function formatDeduplicatedChange(change: DeduplicatedChange): string {
  const flavorFiles = change.flavors.map((f) => `.${f}.mdx`).join(', ');
  const flavorSuffix = change.flavors.length > 1
    ? ` → update ${flavorFiles} files`
    : ` → update ${flavorFiles} file`;
  return `- **${change.name}**: ${change.description}${flavorSuffix}`;
}

/**
 * Generates a combined prompt for multiple packages.
 */
function generateMultiPackagePrompt(packages: ReleasedPackage[]): string {
  const packageList = packages.map((p) => `- ${p.name} v${p.version}`).join('\n');
  const flavorsIncluded = [...new Set(packages.map((p) => getPackageFlavor(p.name)))];

  const deduplicated = deduplicateChanges(packages);
  const hasChanges = deduplicated.newWidgets.length > 0 ||
    deduplicated.newConnectors.length > 0 ||
    deduplicated.newHooks.length > 0 ||
    deduplicated.modifiedComponents.length > 0 ||
    deduplicated.breakingChanges.length > 0 ||
    deduplicated.deprecations.length > 0;

  let prompt = `You are updating documentation for InstantSearch releases:
${packageList}

## Overview

InstantSearch has multiple flavors, each with its own documentation file suffix:
- \`instantsearch.js\` (vanilla JS) → \`.js.mdx\` files
- \`react-instantsearch\` (React) → \`.react.mdx\` files
- \`vue-instantsearch\` (Vue) → \`.vue.mdx\` files

Most widgets/hooks exist in multiple flavors with the same API. When a widget is added or modified, you typically need to update the documentation file for each relevant flavor.

**Flavors in this release:** ${flavorsIncluded.map(f => `.${f}.mdx`).join(', ')}

## Task

**IMPORTANT: Before making any changes, first explore the documentation structure.**

1. Use \`Glob\` to find documentation files: look for patterns like \`**/instantsearch/**\`, \`**/widgets/**\`, or \`**/api-reference/**\`
2. Read a few existing widget/hook documentation files to understand the format
3. Then update/create documentation for each change below

## Changes to Document

`;

  if (!hasChanges) {
    prompt += `No significant documentation changes detected.\n\n`;
  }

  if (deduplicated.newWidgets.length > 0) {
    prompt += `### New Widgets
${deduplicated.newWidgets.map(formatDeduplicatedChange).join('\n')}

`;
  }

  if (deduplicated.newConnectors.length > 0) {
    prompt += `### New Connectors
${deduplicated.newConnectors.map(formatDeduplicatedChange).join('\n')}

`;
  }

  if (deduplicated.newHooks.length > 0) {
    prompt += `### New Hooks
${deduplicated.newHooks.map(formatDeduplicatedChange).join('\n')}

`;
  }

  if (deduplicated.modifiedComponents.length > 0) {
    prompt += `### Modified Components
${deduplicated.modifiedComponents.map(formatDeduplicatedChange).join('\n')}

`;
  }

  if (deduplicated.breakingChanges.length > 0) {
    prompt += `### Breaking Changes
${deduplicated.breakingChanges.map(formatDeduplicatedChange).join('\n')}

`;
  }

  if (deduplicated.deprecations.length > 0) {
    prompt += `### Deprecations
${deduplicated.deprecations.map(formatDeduplicatedChange).join('\n')}

`;
  }

  prompt += `## Source References

${packages.map((p) => `- [${p.name} CHANGELOG](https://github.com/algolia/instantsearch/blob/master/packages/${p.name}/CHANGELOG.md)`).join('\n')}

## Instructions

1. **Explore first**: Use Glob and Read to understand the docs structure before making changes
2. For new widgets/connectors/hooks, create new MDX files following the existing patterns
3. For modified components, update the existing documentation to include new props/options
4. Match the existing format and style exactly
5. Include TypeScript types and code examples where appropriate
6. For breaking changes, update the migration guide if applicable
7. **Update all relevant flavor files**: Each change lists which \`.{flavor}.mdx\` files need updates

## Documentation Format Reference

Widget/Hook documentation typically follows this MDX structure:

\`\`\`mdx
---
title: ComponentName
description: Brief description of the component
---

<ParamField path="propName" type="string" required>
  Description of the prop.
</ParamField>

<ParamField path="optionalProp" type="boolean" default="false">
  Description of the optional prop.
</ParamField>
\`\`\`

## Important

- Only modify documentation files, do not modify any other files
- Follow the existing documentation style and patterns
- Make sure all code examples are correct and working
- Do not add any placeholder content - only document what actually exists
- **Explore the docs structure first before making changes**
`;

  return prompt;
}

/**
 * Detects if a change is adding a new component.
 */
function isNewComponentChange(change: ChangeEntry, componentType: 'widget' | 'connector' | 'hook'): boolean {
  const description = change.description.toLowerCase();
  const addIndicators = ['add', 'new', 'introduce', 'implement', 'create'];

  const hasAddIndicator = addIndicators.some((ind) => description.includes(ind));

  if (componentType === 'widget') {
    return hasAddIndicator && (description.includes('widget') || description.includes('component'));
  }
  if (componentType === 'connector') {
    return hasAddIndicator && description.includes('connector');
  }
  if (componentType === 'hook') {
    return hasAddIndicator && (description.includes('hook') || (change.scope?.startsWith('use') ?? false));
  }

  return false;
}

/**
 * Extracts a component name from the description.
 */
function extractComponentName(description: string): string {
  // Try to find PascalCase or backtick-quoted names
  const pascalMatch = description.match(/`?([A-Z][a-zA-Z]+)`?/);
  if (pascalMatch) {
    return pascalMatch[1];
  }

  // Try to find camelCase names
  const camelMatch = description.match(/`([a-z][a-zA-Z]+)`/);
  if (camelMatch) {
    return camelMatch[1];
  }

  return 'Unknown';
}

/**
 * Main entry point.
 */
async function main(): Promise<void> {
  const { command, options } = parseArgs();
  const repoRoot = getRepoRoot();
  const packagesDir = path.join(repoRoot, 'packages');

  if (options.verbose) {
    console.log('Repo root:', repoRoot);
    console.log('Packages dir:', packagesDir);
  }

  switch (command) {
    case 'parse-changelog': {
      await runParseChangelog(packagesDir, options);
      break;
    }

    case 'generate-prompt': {
      await runGeneratePrompt(packagesDir, options);
      break;
    }

    case 'help':
    default: {
      printHelp();
      break;
    }
  }
}

/**
 * Parses changelogs and outputs classification.
 */
async function runParseChangelog(
  packagesDir: string,
  options: CLIOptions
): Promise<void> {
  console.log('Parsing CHANGELOGs...');

  if (options.package) {
    const changelogPath = path.join(packagesDir, options.package, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) {
      console.error(`CHANGELOG not found: ${changelogPath}`);
      process.exit(1);
    }

    const releases = parseChangelog(changelogPath);
    const latestRelease = getLatestRelease(releases, { skipEmpty: true });

    if (latestRelease) {
      console.log(`\nLatest release: ${latestRelease.packageName}@${latestRelease.version}`);
      console.log(`Changes: ${latestRelease.changes.length}`);

      const needs = classifyChanges([latestRelease]);
      if (needs.length > 0) {
        console.log(`Documentation priority: ${needs[0].priority}`);
        console.log(`Suggested content types: ${needs[0].suggestedContentTypes.join(', ')}`);

        // Output JSON for machine parsing
        if (options.outputDir) {
          const outputPath = path.join(options.outputDir, 'changelog-analysis.json');
          const outputDirPath = path.dirname(outputPath);
          if (!fs.existsSync(outputDirPath)) {
            fs.mkdirSync(outputDirPath, { recursive: true });
          }
          fs.writeFileSync(
            outputPath,
            JSON.stringify(
              {
                packageName: latestRelease.packageName,
                version: latestRelease.version,
                date: latestRelease.date,
                changes: latestRelease.changes,
                priority: needs[0].priority,
                contentTypes: needs[0].suggestedContentTypes,
              },
              null,
              2
            )
          );
          console.log(`\nWritten: ${outputPath}`);
        }
      }
    }
  } else {
    const allChangelogs = parseAllChangelogs(packagesDir);
    console.log(`Found ${allChangelogs.size} packages with CHANGELOGs`);

    for (const [pkg, releases] of allChangelogs) {
      const latest = getLatestRelease(releases);
      if (latest) {
        console.log(`  ${pkg}@${latest.version} (${latest.changes.length} changes)`);
      }
    }
  }
}

/**
 * Detects all packages that were released (have documentation needs).
 * This is used when --package is not specified to auto-detect all released packages.
 *
 * Filters to:
 * - Only main documentation packages (instantsearch.js, react-instantsearch, vue-instantsearch)
 * - Only high or medium priority (skip low priority / bug-fix-only releases)
 */
function detectReleasedPackages(packagesDir: string, verbose: boolean): ReleasedPackage[] {
  const allChangelogs = parseAllChangelogs(packagesDir);
  const releasedPackages: ReleasedPackage[] = [];

  for (const [packageName, releases] of allChangelogs) {
    // Skip non-main packages (they don't have separate widget docs)
    if (!isMainDocPackage(packageName)) {
      if (verbose) {
        console.log(`  Skipping ${packageName} (not a main doc package)`);
      }
      continue;
    }

    const latestRelease = getLatestRelease(releases, { skipEmpty: true });
    if (!latestRelease) continue;

    const needs = classifyChanges([latestRelease]);
    if (needs.length === 0 || needs[0].priority === 'none') continue;

    // Skip low priority (bug-fix-only releases)
    if (needs[0].priority === 'low') {
      if (verbose) {
        console.log(`  Skipping ${packageName}@${latestRelease.version} (low priority)`);
      }
      continue;
    }

    releasedPackages.push({
      name: packageName,
      version: latestRelease.version,
      need: needs[0],
    });

    if (verbose) {
      console.log(`  Detected: ${packageName}@${latestRelease.version} (${needs[0].priority} priority)`);
    }
  }

  return releasedPackages;
}

/**
 * Generates a prompt for Claude Code CLI.
 * If --package is specified, generates for that single package.
 * Otherwise, auto-detects all released packages and generates a combined prompt.
 */
async function runGeneratePrompt(
  packagesDir: string,
  options: CLIOptions
): Promise<void> {
  let releasedPackages: ReleasedPackage[];

  if (options.package) {
    // Single package mode (backward compatible)
    const targetPackage = options.package;
    const changelogPath = path.join(packagesDir, targetPackage, 'CHANGELOG.md');

    if (!fs.existsSync(changelogPath)) {
      console.error(`CHANGELOG not found: ${changelogPath}`);
      process.exit(1);
    }

    const releases = parseChangelog(changelogPath);
    const latestRelease = getLatestRelease(releases, { skipEmpty: true });

    if (!latestRelease) {
      console.error(`No releases found for ${targetPackage}`);
      process.exit(1);
    }

    const needs = classifyChanges([latestRelease]);

    if (needs.length === 0 || needs[0].priority === 'none') {
      console.log('No documentation needs detected for this release');
      process.exit(0);
    }

    const need = needs[0];
    const version = options.version || latestRelease.version;

    releasedPackages = [{
      name: targetPackage,
      version,
      need,
    }];
  } else {
    // Auto-detect mode: find all packages with documentation needs
    console.log('Auto-detecting released packages with documentation needs...');
    releasedPackages = detectReleasedPackages(packagesDir, options.verbose);

    if (releasedPackages.length === 0) {
      console.log('No packages with documentation needs detected');
      process.exit(0);
    }

    console.log(`Found ${releasedPackages.length} package(s) with documentation needs:`);
    for (const pkg of releasedPackages) {
      console.log(`  - ${pkg.name}@${pkg.version} (${pkg.need.priority} priority)`);
    }
  }

  const prompt = generateMultiPackagePrompt(releasedPackages);

  // Also output package info as JSON for the workflow
  const packagesInfo = releasedPackages.map((p) => ({
    name: p.name,
    version: p.version,
    priority: p.need.priority,
  }));

  if (options.outputDir) {
    // Write prompt to file (for GitHub Actions)
    const outputPath = options.outputDir.endsWith('.txt')
      ? options.outputDir
      : path.join(options.outputDir, 'prompt.txt');
    const outputDirPath = path.dirname(outputPath);
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }
    fs.writeFileSync(outputPath, prompt);
    console.log(`Prompt written to: ${outputPath}`);

    // Also write packages info JSON
    const jsonPath = outputPath.replace('.txt', '-packages.json');
    fs.writeFileSync(jsonPath, JSON.stringify(packagesInfo, null, 2));
    console.log(`Packages info written to: ${jsonPath}`);
  } else {
    // Print to stdout
    console.log(prompt);
  }
}

/**
 * Prints help information.
 */
function printHelp(): void {
  console.log(`
InstantSearch Documentation Automation

Usage: npx tsx src/index.ts <command> [options]

Commands:
  parse-changelog      Parse and classify CHANGELOG changes
  generate-prompt      Generate a prompt for Claude Code CLI
  help                 Show this help message

Options:
  --dry-run            Run without making changes
  --verbose            Show detailed output
  --package <name>     Target a specific package (omit to auto-detect all)
  --version <ver>      Specify version (default: latest from changelog)
  --output <dir>       Output directory/file for generated content

Examples:
  # Parse changelogs for all packages
  npx tsx src/index.ts parse-changelog

  # Parse changelog for a specific package
  npx tsx src/index.ts parse-changelog --package react-instantsearch

  # Auto-detect all released packages and generate combined prompt
  npx tsx src/index.ts generate-prompt --output ./prompt.txt

  # Generate Claude prompt for a specific package
  npx tsx src/index.ts generate-prompt --package instantsearch.js --output ./prompt.txt

  # Use with Claude Code CLI (in docs-new directory)
  claude -p "$(cat prompt.txt)" \\
    --allowedTools "Read,Edit,Write,Bash(git diff *),Bash(git status *),Glob,Grep"
`);
}

// Run main
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
