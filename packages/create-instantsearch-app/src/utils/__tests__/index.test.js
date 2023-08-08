const mockExistsSync = jest.fn();
const mockLstatSync = jest.fn();
const mockReaddirSync = jest.fn();

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  lstatSync: mockLstatSync,
  readdirSync: mockReaddirSync,
}));

const utils = require('../');

describe('checkAppName', () => {
  test('does not throw when valid', () => {
    expect(() => utils.checkAppName('project-name')).not.toThrow();
  });

  test('throws with correct error message', () => {
    expect(() => utils.checkAppName('./project-name'))
      .toThrowErrorMatchingInlineSnapshot(`
      "Could not create a project called \\"<red>./project-name</color>\\" because of npm naming restrictions.
        - name cannot start with a period
        - name can only contain URL-friendly characters"
    `);
  });
});

describe('checkAppPath', () => {
  describe('with non existing directory as path', () => {
    beforeAll(() => {
      mockExistsSync.mockImplementation(() => false);
    });

    test('should not throw', () => {
      expect(() => utils.checkAppPath('path')).not.toThrow();
    });

    afterAll(() => {
      mockExistsSync.mockReset();
    });
  });

  describe('with non empty directory as path', () => {
    beforeAll(() => {
      mockExistsSync.mockImplementation(() => true);
      mockLstatSync.mockImplementation(() => ({ isDirectory: () => true }));
      mockReaddirSync.mockImplementation(() => ['file1', 'file2']);
    });

    test('should throw with correct error', () => {
      expect(() =>
        utils.checkAppPath('path')
      ).toThrowErrorMatchingInlineSnapshot(
        `"Could not create project in destination folder \\"<red>path</color>\\" because it is not empty."`
      );
    });

    afterAll(() => {
      mockExistsSync.mockReset();
      mockLstatSync.mockReset();
      mockReaddirSync.mockReset();
    });
  });

  describe('with existing file as path', () => {
    beforeAll(() => {
      mockExistsSync.mockImplementation(() => true);
      mockLstatSync.mockImplementation(() => ({
        isDirectory: () => false,
      }));
    });

    test('should throw with correct error', () => {
      expect(() =>
        utils.checkAppPath('path')
      ).toThrowErrorMatchingInlineSnapshot(
        `"Could not create project at path <red>path</color> because a file of the same name already exists."`
      );
    });

    afterAll(() => {
      mockExistsSync.mockReset();
      mockLstatSync.mockReset();
    });
  });

  describe('with empty string as path', () => {
    beforeAll(() => {
      mockExistsSync.mockImplementation(() => false);
      mockLstatSync.mockImplementation(() => ({
        isDirectory: () => false,
      }));
    });

    test('should throw with correct error', () => {
      expect(() => utils.checkAppPath('')).toThrowErrorMatchingInlineSnapshot(
        `"Could not create project without directory"`
      );
    });

    afterAll(() => {
      mockExistsSync.mockReset();
      mockLstatSync.mockReset();
    });
  });
});

describe('checkTemplateConfigFile', () => {
  test('with correct file does not throw', () => {
    expect(() => {
      const requireMock = jest.fn(() => ({
        libraryName: 'library-name',
      }));

      utils.getAppTemplateConfig('my-template', { loadFileFn: requireMock });
    }).not.toThrow();
  });
});

describe('getTemplatesByCategory', () => {
  beforeAll(() => {
    mockReaddirSync.mockImplementation(() => [
      'InstantSearch.js',
      'Angular InstantSearch',
      'React InstantSearch',
      'Vue InstantSearch',
      'React InstantSearch Native',
      'InstantSearch iOS',
      'InstantSearch Android',
    ]);
    mockLstatSync.mockImplementation(() => ({ isDirectory: () => true }));
  });

  test('return the correct templates and categories', () => {
    expect(utils.getTemplatesByCategory()).toEqual({
      Web: expect.arrayContaining([
        'InstantSearch.js',
        'Angular InstantSearch',
        'React InstantSearch',
        'Vue InstantSearch',
      ]),
      Mobile: expect.arrayContaining([
        'React InstantSearch Native',
        'InstantSearch iOS',
        'InstantSearch Android',
      ]),
    });
  });

  afterAll(() => {
    mockReaddirSync.mockReset();
    mockLstatSync.mockReset();
  });
});
