# Claude Instructions for create-instantsearch-app

## Package Overview

`create-instantsearch-app` is a CLI tool that scaffolds InstantSearch applications across multiple frameworks and platforms. It provides interactive prompts to generate boilerplate code for InstantSearch.js, React InstantSearch, Vue InstantSearch, and mobile platforms (iOS, Android).

**Version:** 7.5.28
**Type:** Command-line scaffolding tool
**Technologies:** Node.js, Metalsmith, Handlebars templates

## Project Structure

```
create-instantsearch-app/
├── src/
│   ├── api/          # API for programmatic usage
│   ├── cli/          # Command-line interface
│   ├── tasks/        # Task runners for generation
│   ├── templates/    # Handlebars templates for each framework
│   └── utils/        # Utility functions
├── e2e/              # End-to-end tests
├── docs/             # Documentation
└── scripts/          # Build and release scripts
```

## Key Concepts

### Template System

The tool uses **Metalsmith** with **Handlebars** templates to generate project files:

- Templates are located in `src/templates/`
- Each template supports different InstantSearch flavours
- Variables are injected via Handlebars syntax: `{{variable}}`
- Conditional rendering: `{{#if condition}}...{{/if}}`

### Supported Frameworks

1. **InstantSearch.js** - Vanilla JavaScript
2. **React InstantSearch** - React components
3. **Vue InstantSearch** - Vue components
4. **InstantSearch iOS** - Swift/iOS
5. **InstantSearch Android** - Kotlin/Android

## Development Guidelines

### Adding New Templates

When adding a new template or framework:

1. Create template directory in `src/templates/`
2. Use Handlebars for variable injection
3. Follow existing naming conventions
4. Add tests in `e2e/templates.test.js`
5. Update documentation

**Template Variables:**
```handlebars
{{appId}}              # Algolia Application ID
{{apiKey}}             # Algolia API Key
{{indexName}}          # Index name
{{attributesToDisplay}} # Attributes to show
{{searchPlaceholder}}  # Search box placeholder
```

### Code Style

- **Language:** English for all code, comments, docs
- **Spelling:** UK English (e.g., "optimise", "initialise")
- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Naming:** camelCase for functions/variables, PascalCase for classes

### Testing

Run tests before committing:

```bash
# Unit tests
yarn test

# End-to-end template tests
yarn test:e2e:templates

# End-to-end install tests (slower)
yarn test:e2e:installs
```

### Template Development

Templates use **Handlebars** for code generation:

**Good practices:**
- Keep templates simple and maintainable
- Use consistent variable names across templates
- Add comments explaining complex template logic
- Test generated output with real Algolia credentials

**Example template pattern:**
```handlebars
import {{{ importStatement }}};

const searchClient = algoliasearch(
  '{{appId}}',
  '{{apiKey}}'
);

{{#if enableRouting}}
// Routing configuration
const routing = { ... };
{{/if}}
```

## Common Tasks

### Adding a New InstantSearch Widget

When templates need to support a new widget:

1. Check widget compatibility across all frameworks
2. Update template files in relevant framework directories
3. Add widget to default configurations if appropriate
4. Update tests to verify widget generation
5. Document new widget in README

### Updating Framework Versions

When updating InstantSearch framework versions:

1. Update dependency versions in template `package.json` files
2. Review breaking changes in changelog
3. Update code patterns if APIs changed
4. Run full test suite: `yarn test && yarn test:e2e`
5. Update migration guides if needed

### Debugging Generated Apps

To debug generated applications:

```bash
# Generate app with debug logging
DEBUG=* yarn start

# Generate in specific directory for inspection
yarn start --path ./test-app --template "React InstantSearch"

# Skip npm install for faster iteration
yarn start --no-installation
```

## Architecture

### CLI Flow

1. **Prompt user** - Interactive questions via Inquirer
2. **Validate input** - Check app name, credentials
3. **Generate files** - Metalsmith + Handlebars processing
4. **Install dependencies** - npm/yarn install
5. **Display next steps** - Success message with commands

### Key Files

- **`src/cli/index.js`** - CLI entry point
- **`src/tasks/`** - Task implementations (generate, install, etc.)
- **`src/api/`** - Programmatic API for library usage
- **`src/templates/`** - Framework-specific templates

## Best Practices

### Template Maintenance

- **Keep DRY:** Extract common patterns to shared partials
- **Version pins:** Always pin exact versions in templates
- **Accessibility:** Include ARIA labels and semantic HTML
- **TypeScript:** Prefer TypeScript templates when available
- **Modern syntax:** Use latest stable JavaScript features

### Error Handling

- Validate Algolia credentials before generation
- Provide clear error messages with recovery steps
- Handle network failures gracefully
- Exit with appropriate status codes (0 = success, 1 = error)

### Documentation

- Update README when adding features
- Document template variables in `docs/`
- Keep CHANGELOG.md updated
- Add inline comments for complex logic

## Testing Strategy

### Unit Tests (`src/`)

- Test utility functions in isolation
- Mock external dependencies (Algolia API, file system)
- Test validation logic thoroughly

### E2E Tests (`e2e/`)

- **Template tests:** Verify all templates generate successfully
- **Install tests:** Verify dependencies install without errors
- Test with real Algolia credentials (sandbox)
- Snapshot tests for generated file structure

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Run full test suite: `yarn test && yarn test:e2e`
4. Build templates: `yarn release-templates`
5. Create PR and get approval
6. Merge to main
7. Release via Shipjs: `yarn release`

## Troubleshooting

### Template Generation Fails

- Check Handlebars syntax in template files
- Verify all required variables are provided
- Check Metalsmith plugin order
- Review error stack trace for file path issues

### Generated App Won't Start

- Verify dependency versions are compatible
- Check for breaking changes in InstantSearch versions
- Test with fresh `node_modules` (delete and reinstall)
- Verify Algolia credentials are valid

### Tests Failing

- Check Node.js version (>= 10 required)
- Clear Jest cache: `jest --clearCache`
- Verify test snapshots are up to date
- Check for environment-specific issues (Windows paths, etc.)

## Integration Points

### Algolia Services

- **Search API:** Used to validate credentials and test indices
- **InstantSearch libraries:** React InstantSearch, Vue InstantSearch, etc.
- **UI components:** `instantsearch-ui-components`

### External Dependencies

- **Metalsmith:** Static site generator for file processing
- **Inquirer:** Interactive CLI prompts
- **Commander:** CLI argument parsing
- **Prettier:** Code formatting for generated files

## Contributing

When contributing to this package:

1. Follow existing code patterns and structure
2. Add tests for new features
3. Update documentation
4. Use conventional commit messages: `feat:`, `fix:`, `docs:`, etc.
5. Ensure all tests pass before submitting PR
6. Consider backwards compatibility

## Resources

- [InstantSearch.js Documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/)
- [React InstantSearch Documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/)
- [Vue InstantSearch Documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/vue/)
- [Metalsmith Documentation](https://metalsmith.io/)
- [Handlebars Documentation](https://handlebarsjs.com/)

## Notes

- This is a **scaffolding tool** - generated code should be production-ready
- Templates should reflect current best practices
- Always test generated apps manually after template changes
- Consider developer experience when designing prompts and error messages
