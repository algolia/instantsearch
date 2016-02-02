// this is the karma bundle we serve, instead of unique test files

const testsContext = require.context('../src', true, /-test\.js$/);
testsContext.keys().forEach(testsContext);
