/* eslint-disable complexity */

/*
 * PoC — copied from `react-instantsearch-core/src/lib/dequal.ts`
 * (itself dequal/lite v2.0.0 with a 3rd `compare(a, b)` argument used to
 * skip comparing function references). The sharing-strategy ticket decides
 * the neutral home for this helper.
 */

const has = Object.prototype.hasOwnProperty;

export function dequal(foo, bar, compare) {
  // start of custom implementation
  if (compare && compare(foo, bar)) {
    return true;
  }
  // end of custom implementation

  let ctor;
  let len;
  if (foo === bar) return true;

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
