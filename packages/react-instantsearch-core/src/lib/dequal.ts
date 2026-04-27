/* eslint-disable complexity */

/*
 * Code taken from dequal/lite v2.0.0
 * https://github.com/lukeed/dequal/blob/9aa73181ac7e081cd330cac67d313632ac04bb02/src/lite.js
 *
 * It adds a 3rd argument `compare(a, b)` that lets execute custom logic to
 * compare values.
 * We use it to skip comparing function references.
 */

// eslint-disable-next-line typescript/unbound-method
const has = Object.prototype.hasOwnProperty;

export function dequal(
  foo: any,
  bar: any,
  compare?: (a: any, b: any) => boolean
) {
  // start of custom implementation
  if (compare?.(foo, bar)) {
    return true;
  }
  // end of custom implementation

  let ctor;
  let len;
  if (foo === bar) return true;

  // `Error` instances often have no enumerable own properties, so the object
  // branch below can incorrectly treat two different failures as equal. That
  // skipped React updates in useConnector when a new Error had the same
  // `.message` as the previous one (stale chat error UI).
  if (
    foo &&
    bar &&
    foo instanceof Error &&
    bar instanceof Error &&
    foo !== bar
  ) {
    return false;
  }

  if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
    if (ctor === Date) return foo.getTime() === bar.getTime();
    if (ctor === RegExp) return foo.toString() === bar.toString();

    if (ctor === Array) {
      if ((len = foo.length) === bar.length) {
        while (len-- && dequal(foo[len], bar[len], compare));
      }
      return len === -1;
    }

    if (!ctor || typeof foo === 'object') {
      len = 0;
      // eslint-disable-next-line guard-for-in, instantsearch/no-for-in
      for (ctor in foo) {
        if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
        if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor], compare))
          return false;
      }
      return Object.keys(bar).length === len;
    }
  }

  // eslint-disable-next-line no-self-compare
  return foo !== foo && bar !== bar;
}
