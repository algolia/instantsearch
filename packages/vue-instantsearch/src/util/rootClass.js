/**
 * Folds a `class` binding into the class the shared factory composes onto its
 * root element, and returns the attributes that are left.
 *
 * Vue 3 keeps `class` in `$attrs`, and `inheritAttrs: false` stops it reaching
 * the root — while the shared component puts its own `className` there, which
 * the React-compat `createElement` keeps over a second `class`. Asking the
 * factory for the class instead keeps both. Vue 2 leaves `class` out of `$attrs`
 * and applies it to the root element itself, so this is a no-op there.
 *
 * `takeRootClass` is for factories configured through `classNames.root`,
 * `takeClassName` for the ones that take a `className` prop directly.
 */
export function takeRootClass(classNames, attrs) {
  const { value, attrs: left } = takeClass(attrs);

  if (!value) {
    return { classNames, attrs: left };
  }

  return {
    classNames: {
      ...classNames,
      root: join(classNames && classNames.root, value),
    },
    attrs: left,
  };
}

export function takeClassName(className, attrs) {
  const { value, attrs: left } = takeClass(attrs);

  if (!value) {
    return { className, attrs: left };
  }

  return { className: join(className, value), attrs: left };
}

function takeClass(attrs) {
  const value = attrs.class;

  if (!value) {
    return { value: undefined, attrs };
  }

  const left = { ...attrs };
  delete left.class;

  return { value: toClassString(value), attrs: left };
}

function join(...values) {
  return values.filter(Boolean).join(' ');
}

// `class` bindings come in three shapes: a string, an array of them, or an
// object where each key is applied when its value is truthy.
function toClassString(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return join(...value.map(toClassString));
  }

  return Object.keys(value)
    .filter((key) => value[key])
    .join(' ');
}
