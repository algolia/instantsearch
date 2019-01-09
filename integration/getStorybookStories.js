// This file is not directly imported by Node but it runs through Webpack first
// because it relies on Webpack `require.context` feature. It also relies on a
// loader that ignores the CSS import to avoid to run it from Node environment.
// The stories are laoded at runtime to be able to retrieve them later with the
// `getStorybook` function.

const { configure, getStorybook } = require('@storybook/react');

const req = require.context(
  '../stories',
  true,
  // Filter GeoSearch to because it's too brittle
  /^((?!GeoSearch).)*\.stories\.js$/
);

const loadStories = () => {
  req.keys().forEach(filename => req(filename));
};

configure(loadStories, module);

// Use this funciton rather than `snakeCase` because we keep the lower / upper
// case to have the same filename format in Argos that we have now.
const normalize = input => input.replace(/[ -/]/g, '_');

const createStoryURL = ({ host, port, query }) =>
  `http://${host}:${port}/iframe.html${query}`;

const createStoryQueryParameters = (kind, name) => {
  const safeKind = encodeURIComponent(kind);
  const safeName = encodeURIComponent(name);

  return `?selectedKind=${safeKind}&selectedStory=${safeName}`;
};

const getStorybookStories = ({ host, port }) =>
  getStorybook().reduce(
    (acc, { kind, stories }) =>
      acc.concat(
        stories.map(({ name }) => ({
          kind: normalize(kind),
          name: normalize(name),
          url: createStoryURL({
            query: createStoryQueryParameters(kind, name),
            host,
            port,
          }),
        }))
      ),
    []
  );

module.exports = getStorybookStories;
