const https = require('https');

function fetchCachedLibraryVersions() {
  const cache = new Map();
  return function fetchLibraryVersions(libraryName) {
    if (cache.has(libraryName)) {
      return Promise.resolve(cache.get(libraryName));
    }

    return new Promise((resolve) => {
      https.get(`https://registry.npmjs.org/${libraryName}`, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          const library = JSON.parse(body);
          const versions = Object.keys(library.versions).reverse();

          cache.set(libraryName, versions);
          resolve(versions);
        });
      });
    });
  };
}

module.exports = {
  fetchLibraryVersions: fetchCachedLibraryVersions(),
};
