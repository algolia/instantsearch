import { h, Fragment } from 'vue';

/**
 * A `createElement` for the shared `instantsearch-ui-components` factories on
 * Vue 3: they are written as JSX, so children arrive as trailing arguments and
 * a conditional child can be `false`.
 */
export const createElement = (tag, props, ...rest) => {
  const children = flatten(rest);

  if (children.length === 0) {
    return h(tag, props);
  }

  if (tag === Fragment) {
    return h(tag, children);
  }

  if (typeof tag === 'string') {
    // An element takes children, not slots — the slots form renders it empty.
    return h(tag, props, children);
  }

  const child = children.length === 1 ? children[0] : children;
  // It does work to just pass a string but outputs a warning about performance issues
  const newChildren =
    typeof child === 'string' ? { default: () => child } : child;

  return h(tag, Object.assign(props, { children }), newChildren);
};

function flatten(nodes) {
  const out = [];

  nodes.forEach((node) => {
    if (Array.isArray(node)) {
      out.push(...flatten(node));
    } else if (node !== undefined && node !== null && node !== false) {
      out.push(node);
    }
  });

  return out;
}

export { Fragment };
