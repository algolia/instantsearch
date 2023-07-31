const https = require('https');

function fetchCachedLibraryVersions() {
  const cache = new Map();
  return function fetchLibraryVersions(libraryName) {
    if (cache.has(libraryName)) {
      return Promise.resolve(cache.get(libraryName));
    }

    return new Promise((resolve, reject) => {
      https
        .get(`https://registry.npmjs.org/${libraryName}`, (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });

          res.on('end', () => {
            try {
              const library = JSON.parse(body);
              const versions = Object.keys(library.versions).reverse();

              cache.set(libraryName, versions);
              resolve(versions);
            } catch (err) {
              reject(err);
            }
          });
        })
        .on('error', reject);
    });
  };
}

module.exports = {
  fetchLibraryVersions: fetchCachedLibraryVersions(),
};
