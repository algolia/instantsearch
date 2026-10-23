/**
 * Vue scoped slots do not receive `h`, but the `panel` slot has to build its
 * own wrapper elements around the pre-rendered `elements` (VNodes). This
 * recovers the render function from one of those VNodes (Vue 2), or from
 * `vue` itself (Vue 3).
 */
export function getVueH(elements: Record<string, any>) {
  const vnode = Object.keys(elements)
    .map((key) => elements[key])
    .flat()
    .find(Boolean);

  if (vnode && vnode.context && vnode.context.$createElement) {
    return vnode.context.$createElement as (...args: any[]) => any;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('vue').h as (...args: any[]) => any;
}
