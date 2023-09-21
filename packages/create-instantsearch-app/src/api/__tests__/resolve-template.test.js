const path = require('path');

const resolveTemplate = require('../resolve-template');

describe('resolveTemplate', () => {
  test('selects the template with unknown template', () => {
    expect(
      resolveTemplate(
        {
          template: '../unknown-template',
        },
        {
          supportedTemplates: [],
        }
      )
    ).toBe('../unknown-template');
  });

  test('selects the default template with known template', () => {
    expect(
      resolveTemplate(
        {
          template: 'InstantSearch.js',
        },
        {
          supportedTemplates: ['InstantSearch.js'],
        }
      )
    ).toBe(path.resolve('src/templates/InstantSearch.js'));
  });

  test('throws with unsupported version', () => {
    expect(() =>
      resolveTemplate(
        {
          template: 'InstantSearch.js',
          libraryVersion: '1.0.0',
        },
        {
          supportedTemplates: ['InstantSearch.js'],
        }
      )
    ).toThrowErrorMatchingInlineSnapshot(
      `"The template \\"InstantSearch.js\\" does not support the version 1.0.0."`
    );
  });

  test('selects the selected template with complete path', () => {
    expect(
      resolveTemplate(
        {
          template: path.resolve('./src/templates/InstantSearch.js'),
        },
        {
          supportedTemplates: ['InstantSearch.js'],
        }
      )
    ).toBe(path.resolve('./src/templates/InstantSearch.js'));
  });
});
