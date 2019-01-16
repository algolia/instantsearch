const path = require('path');
const resolveTemplate = require('../resolve-template');

describe('resolve-template', () => {
  test('with unknown template', () => {
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

  test('with known template', () => {
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

  test('with InstantSearch.js 2 template', () => {
    expect(
      resolveTemplate(
        {
          template: 'InstantSearch.js',
          libraryVersion: '2.10.0',
        },
        {
          supportedTemplates: ['InstantSearch.js 2'],
        }
      )
    ).toBe(path.resolve('src/templates/InstantSearch.js 2'));
  });
});
