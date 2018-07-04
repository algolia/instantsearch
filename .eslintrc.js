module.exports = {
  extends: ['algolia', 'algolia/jest', 'algolia/react'],
  rules: {
    "no-param-reassign": 0,
    "import/no-extraneous-dependencies": 0,
    "react/no-string-refs": 1,
    "import/extensions": [2, "always", {js: "never"}]
  }
}
