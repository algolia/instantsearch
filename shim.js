// see: https://github.com/facebookincubator/create-react-app/issues/3199
global.requestAnimationFrame = callback => {
  setTimeout(callback, 0);
};
