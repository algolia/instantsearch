#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  parseAllChangelogs,
  parseChangelog,
  classifyChanges,
  getLatestRelease,
} from './changelog/index';

import type { CLIOptions, ChangeEntry } from './types';

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
 * Generates the prompt for Claude Code CLI.
 */
function generateClaudePrompt(
  packageName: string,
  version: string,
  changes: ChangeEntry[],
  priority: string,
  contentTypes: string[]
): string {
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

  let prompt = `You are updating documentation for ${packageName} v${version}.

## Task

Update the documentation files in this repository to reflect the changes in the new release.

## Priority: ${priority}
## Suggested content types: ${contentTypes.join(', ')}

## Changes to Document

`;

  if (newWidgets.length > 0) {
    prompt += `### New Widgets
${newWidgets.map((c) => `- **${c.scope || extractComponentName(c.description)}** - ${c.description}`).join('\n')}

`;
  }

  if (newConnectors.length > 0) {
    prompt += `### New Connectors
${newConnectors.map((c) => `- **${c.scope || extractComponentName(c.description)}** - ${c.description}`).join('\n')}

`;
  }

  if (newHooks.length > 0) {
    prompt += `### New Hooks
${newHooks.map((c) => `- **${c.scope || extractComponentName(c.description)}** - ${c.description}`).join('\n')}

`;
  }

  if (modifiedComponents.length > 0) {
    prompt += `### Modified Components
${modifiedComponents.map((c) => `- **${c.scope || 'General'}** - ${c.description}`).join('\n')}

`;
  }

  if (breakingChanges.length > 0) {
    prompt += `### Breaking Changes
${breakingChanges.map((c) => `- **${c.scope || 'General'}** - ${c.description}`).join('\n')}

`;
  }

  if (deprecations.length > 0) {
    prompt += `### Deprecations
${deprecations.map((c) => `- **${c.scope || 'General'}** - ${c.description}`).join('\n')}

`;
  }

  prompt += `## Source Reference

- Changelog: https://github.com/algolia/instantsearch/blob/master/packages/${packageName}/CHANGELOG.md
- Source code: https://github.com/algolia/instantsearch/tree/master/packages/${packageName}/src

## Instructions

1. Look at the existing widget docs in \`doc/api-reference/widgets/\` for format reference
2. For new widgets/connectors/hooks, create new MDX files following the existing patterns
3. For modified components, update the existing documentation to include new props/options
4. Follow the \`<ParamField>\` component pattern for props documentation
5. Include TypeScript types and code examples where appropriate
6. For breaking changes, update the migration guide if applicable

## Documentation Format Reference

Widget/Hook documentation should follow this MDX structure:

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
 * Generates a prompt for Claude Code CLI.
 */
async function runGeneratePrompt(
  packagesDir: string,
  options: CLIOptions
): Promise<void> {
  const targetPackage = options.package || 'instantsearch.js';
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

  const prompt = generateClaudePrompt(
    targetPackage,
    version,
    need.changes,
    need.priority,
    need.suggestedContentTypes
  );

  if (options.outputDir) {
    // Write to file (for GitHub Actions)
    const outputPath = options.outputDir.endsWith('.txt')
      ? options.outputDir
      : path.join(options.outputDir, 'prompt.txt');
    const outputDirPath = path.dirname(outputPath);
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }
    fs.writeFileSync(outputPath, prompt);
    console.log(`Prompt written to: ${outputPath}`);
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
  --package <name>     Target a specific package (default: instantsearch.js)
  --version <ver>      Specify version (default: latest from changelog)
  --output <dir>       Output directory/file for generated content

Examples:
  # Parse changelogs for all packages
  npx tsx src/index.ts parse-changelog

  # Parse changelog for a specific package
  npx tsx src/index.ts parse-changelog --package react-instantsearch

  # Generate Claude prompt and print to stdout
  npx tsx src/index.ts generate-prompt --package instantsearch.js

  # Generate Claude prompt and save to file
  npx tsx src/index.ts generate-prompt --package instantsearch.js --output ./prompt.txt

  # Use with Claude Code CLI (in docs-new directory)
  claude -p "$(npx tsx src/index.ts generate-prompt --package instantsearch.js)" \\
    --model claude-sonnet-4-5-20250514 \\
    --allowedTools "Read,Edit,Write,Glob,Grep"
`);
}

// Run main
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
