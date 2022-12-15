const fs = jest.requireActual('fs');

let mockFiles = new Set();
function __setMockFiles(newMockFiles) {
  mockFiles = new Set(newMockFiles);
}

const realStatSync = fs.statSync;
function statSync(pathName, ...args) {
  try {
    return realStatSync(pathName, ...args);
  } catch (e) {
    if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) {
      if (mockFiles.has(pathName)) {
        return {
          isFile() {
            return true;
          },
        };
      }
    }
    throw e;
  }
}

fs.__setMockFiles = __setMockFiles;
fs.statSync = statSync;

module.exports = fs;
