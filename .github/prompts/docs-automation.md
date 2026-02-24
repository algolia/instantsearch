You are updating documentation for InstantSearch.

IMPORTANT: This is a non-interactive automated workflow. Do not ask for user input or clarification.
If you cannot access a file, skip it and work with what you have.
If there are no documentable changes, report that finding and exit successfully.

BE EFFICIENT: You have limited turns. Read multiple files in parallel when possible. Don't over-explore.

## Repository Layout

You are running from the root directory where:
- instantsearch/ contains the InstantSearch source code and changelogs
- docs-new/ contains the documentation repository to update

## Task

1. Read the changelogs to understand what changed in the latest release:
   - instantsearch/packages/instantsearch.js/CHANGELOG.md
   - instantsearch/packages/react-instantsearch/CHANGELOG.md
   - instantsearch/packages/react-instantsearch-core/CHANGELOG.md
   - instantsearch/packages/vue-instantsearch/CHANGELOG.md (low priority - only update Vue docs if this changelog shows explicit feature additions)

2. Find and read ONE existing doc as a format reference:
   - Use Glob to find InstantSearch widget docs: docs-new/**/instantsearch/**/*.mdx
   - Read just ONE example file to understand the format (don't read many)

3. Update documentation for any new features, modified components, or breaking changes.

4. After making changes, run link check to catch broken links:
   - cd docs-new && npm run check:links
   Fix any broken links you introduced, but don't spend time on pre-existing issues.

5. REQUIRED: Write a summary file at CHANGES_SUMMARY.md with this exact format:
   ---
   First line: A short title describing the main change (e.g., 'Add useFrequentlyBoughtTogether hook documentation')

   Blank line, then a markdown list of what was changed:
   - Added docs for X widget/hook
   - Updated Y component with new Z prop
   - Fixed broken links in W page
   ---
   If no changes were made, write 'No documentation changes needed' as the title.

## Flavor Mapping

Each package has its own documentation flavor:
- instantsearch.js → .js.mdx files
- react-instantsearch → .react.mdx files
- vue-instantsearch → .vue.mdx files

## Guidelines

- Focus on the LATEST release section in each changelog
- For new widgets/hooks, create new .{flavor}.mdx files following existing patterns
- For modified components, update existing docs with new props/options
- For breaking changes, update migration guides if applicable
- Match the existing documentation format and style exactly
- Only modify documentation files in docs-new/
- Don't add placeholder content - only document what actually exists
- CROSS-FLAVOR CONSISTENCY: When updating a widget/hook that exists in multiple flavors (JS, React, Vue),
  check if the same prop/feature exists in the other flavors and update ALL relevant docs.
  Many features are shared via instantsearch-ui-components. Read the source for each flavor to verify.

## Source Code Reference

The InstantSearch source is at instantsearch/ for reference.
Read source files to understand APIs, types, and implementation.
Example: instantsearch/packages/instantsearch.js/src/widgets/
