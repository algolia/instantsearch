const mockExistsSync = jest.fn();
const mockLstatSync = jest.fn();
const mockReaddirSync = jest.fn();

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  lstatSync: mockLstatSync,
  readdirSync: mockReaddirSync,
}));

const utils = require('./utils');

describe('checkAppName', () => {
  test('does not throw when valid', () => {
    expect(() => utils.checkAppName('project-name')).not.toThrow();
  });

  test('throws with correct error message', () => {
    expect(() =>
      utils.checkAppName('./project-name')
    ).toThrowErrorMatchingSnapshot();
  });
});

describe('checkAppPath', () => {
  describe('with non existant directory as path', () => {
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
      expect(() => utils.checkAppPath('path')).toThrowErrorMatchingSnapshot();
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
      expect(() => utils.checkAppPath('path')).toThrowErrorMatchingSnapshot();
    });

    afterAll(() => {
      mockExistsSync.mockReset();
      mockLstatSync.mockReset();
    });
  });
});

describe('checkTemplateConfigFile', () => {
  test('with correct file', () => {
    expect(() => {
      const requireMock = jest.fn(() => ({
        libraryName: 'library-name',
      }));

      utils.getAppTemplateConfig('my-template', { loadFileFn: requireMock });
    }).not.toThrow();
  });

  test('without `libraryName`', () => {
    expect(() => {
      const requireMock = jest.fn(() => ({}));

      utils.getAppTemplateConfig('my-template', { loadFileFn: requireMock });
    }).toThrowErrorMatchingSnapshot();
  });
});
