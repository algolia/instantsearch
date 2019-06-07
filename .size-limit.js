module.exports = [
  {
    name: 'UMD',
    path: './dist/instantsearch.production.min.js',
    limit: '80 kB',
  },
  {
    name: 'CJS',
    path: './cjs',
    limit: '100 kB',
  },
  {
    name: 'ESM',
    path: './es',
    limit: '100 kB',
  },
];
