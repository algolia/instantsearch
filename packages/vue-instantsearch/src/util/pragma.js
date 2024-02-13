import { h } from 'vue';

export const createElement = (tag, props, children) => {
  if (!children) {
    return h(tag, props);
  }

  // It does work to just pass a string but outputs a warning about performance issues
  const newChildren =
    typeof children === 'string' ? { default: () => children } : children;
  // Passing a `children` prop to a DOM element outputs a warning
  const newProps =
    typeof tag === 'string' ? props : Object.assign(props, { children });

  return h(tag, newProps, newChildren);
};

export { Fragment } from 'vue';
