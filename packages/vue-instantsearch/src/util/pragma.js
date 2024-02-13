import { h, Fragment } from 'vue';

export const createElement = (tag, props, children) => {
  if (!children) {
    return h(tag, props);
  }

  if (tag === Fragment) {
    return h(tag, Array.isArray(children) ? children : [children]);
  }

  // It does work to just pass a string but outputs a warning about performance issues
  const newChildren =
    typeof children === 'string' ? { default: () => children } : children;
  // Passing a `children` prop to a DOM element outputs a warning
  const newProps =
    typeof tag === 'string' ? props : Object.assign(props, { children });

  return h(tag, newProps, newChildren);
};

export { Fragment };
