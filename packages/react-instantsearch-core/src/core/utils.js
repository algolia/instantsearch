import { isEmpty, isPlainObject } from 'lodash';

// From https://github.com/reactjs/react-redux/blob/master/src/utils/shallowEqual.js
export const shallowEqual = (objA, objB) => {
  if (objA === objB) {
    return true;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  const hasOwn = Object.prototype.hasOwnProperty;
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
};

export const getDisplayName = Component =>
  Component.displayName || Component.name || 'UnknownComponent';

const resolved = Promise.resolve();
export const defer = f => {
  resolved.then(f);
};

export const removeEmptyKey = obj => {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (isEmpty(value) && isPlainObject(value)) {
      delete obj[key];
    } else if (isPlainObject(value)) {
      removeEmptyKey(value);
    }
  });

  return obj;
};
