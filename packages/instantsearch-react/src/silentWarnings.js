/* eslint-disable no-console */

const error = console.error;
console.error = (message, ...args) => {
  if (message.indexOf('Missing React element for debugID') === -1) {
    error.call(console, message, ...args);
  }
};
