import * as Vue from 'vue';

const isVue2 = false;
const isVue3 = true;
const Vue2 = undefined;

export { createApp, createSSRApp, h, version, nextTick, toRaw } from 'vue';
export { Vue, Vue2, isVue2, isVue3 };

/**
 * A Fragment for the React-style renderer: a plain function component that
 * returns its children. Matches the Vue 2 implementation so shared markup
 * serializes identically across versions — the real Vue 3 `Fragment` symbol
 * introduces anchor/whitespace nodes that would break shared snapshots.
 */
export const Fragment = (props) => (props && props.children) || [];

export function renderCompat(fn) {
  function h(tag, props, ...childrenArray) {
    const children = childrenArray.length > 0 ? childrenArray : undefined;
    if (
      typeof props === 'object' &&
      (props.attrs || props.props || props.scopedSlots || props.on)
    ) {
      // In vue 3, we no longer wrap with `attrs` or `props` key.
      const onPropKeys = Object.keys(props.on || {});
      const flatProps = Object.assign(
        {},
        props,
        props.attrs,
        props.props,
        onPropKeys.reduce((acc, key) => {
          // eslint-disable-next-line no-param-reassign
          acc[`on${key[0].toUpperCase()}${key.slice(1)}`] = props.on[key];
          return acc;
        }, {})
      );
      delete flatProps.attrs;
      delete flatProps.props;
      delete flatProps.scopedSlots;
      onPropKeys.forEach((key) => delete flatProps.on[key]);
      if (flatProps.on && Object.keys(flatProps.on).length === 0) {
        delete flatProps.on;
      }

      return Vue.h(
        tag,
        flatProps,
        props.scopedSlots
          ? Object.assign({ default: () => children }, props.scopedSlots)
          : children
      );
    }

    return Vue.h(tag, props, children);
  }

  return function () {
    return fn.call(this, h);
  };
}

/**
 * A `createElement` that understands the React-style markup emitted by
 * `instantsearch-ui-components` factories (`className`, `onClick`/`onKeyDown`
 * handlers, and `ref` as a MutableRef `{ current }`), mapping them onto Vue 3's
 * `h`. Mirrors the Vue 2 implementation in `index-vue2.js`.
 */
export function augmentReactCreateElement(baseH) {
  return function reactCreateElement(tag, rawProps, ...rest) {
    const props = rawProps || {};
    const children = flattenChildren(rest);
    const childArg = children.length > 0 ? children : undefined;

    // Plain function components (shared sub-factories, Fragment) render eagerly.
    if (typeof tag === 'function') {
      return tag(
        Object.assign({}, props, {
          class: props.className || props.class,
          children: childArg,
        })
      );
    }

    const data = {};

    Object.keys(props).forEach((name) => {
      const value = props[name];

      if (name === 'className') {
        data.class = value;
      } else if (name === 'class') {
        // Shared components may spread their remaining props (which include
        // the `class` this adapter hands them) after `className`.
        data.class = data.class || value;
      } else if (name === 'children') {
        // handled via the children argument
      } else if (name === 'htmlFor') {
        data.for = value;
      } else if (name === 'ref') {
        const vueRef = toVueRef(value);
        if (vueRef) {
          data.ref = vueRef;
        }
      } else if (isEventProp(name, value)) {
        // React `onKeyDown` -> Vue 3 `onKeydown` (compiler-style handler key),
        // `onFocusCapture` -> `onFocusCapture`, which Vue 3 binds in the
        // capture phase.
        const isCapture = isCaptureEventProp(name);
        const eventName = name
          .slice(2, isCapture ? -CAPTURE_SUFFIX.length : undefined)
          .toLowerCase();
        const handlerKey = `on${eventName[0].toUpperCase()}${eventName.slice(
          1
        )}${isCapture ? CAPTURE_SUFFIX : ''}`;

        // A component takes React-style callbacks as props, not as listeners —
        // and the handler key is lower-cased past its first letter, so
        // `onToggleMaximize` becomes `onTogglemaximize` and a component
        // declaring the prop receives nothing. Offer it under its own name.
        const isComponent = typeof tag !== 'string';
        const declaresCallback = isComponent && declaresProp(tag, name);
        // A child that also declares this event in `emits` is reached through
        // the handler key — `$emit('keydown')` looks `onKeydown` up on the
        // vnode — and a declared emit keeps that key from falling through to
        // the root element, so there is nothing to double here. A capture
        // callback is not that key: `$emit` resolves `onFocus`, never
        // `onFocusCapture`, so for a `Capture` prop the key buys nothing and
        // only falls through to the child root beside the binding it makes.
        const declaresEmittedEvent =
          isComponent && !isCapture && declaresEmit(tag, eventName);

        // An `onX` key the child does not declare falls through to its root
        // element as a listener, so a child that declares the callback and
        // binds it itself would run it twice per event: the handler key stays
        // out of the vnode once the prop carries it.
        if (!declaresCallback || declaresEmittedEvent) {
          data[handlerKey] = value;
        }

        if (isComponent) {
          // Declared props are matched before Vue reads a key as a listener,
          // and an `onX` key is never rendered as an attribute, so this cannot
          // leak onto the child's root element.
          data[name] = value;
        }
      } else if (typeof value === 'boolean' && name.indexOf('aria-') === 0) {
        data[name] = String(value);
      } else {
        data[name] = value;
      }
    });

    return baseH(tag, data, childArg);
  };
}

export function renderReactCompat(fn) {
  return function () {
    return fn.call(this, augmentReactCreateElement(Vue.h));
  };
}

const CAPTURE_SUFFIX = 'Capture';

function isCaptureEventProp(name) {
  return name.slice(-CAPTURE_SUFFIX.length) === CAPTURE_SUFFIX;
}

function isEventProp(name, value) {
  if (typeof value !== 'function' || name.length < 3) {
    return false;
  }
  // Matches `on` followed by an uppercase letter (e.g. onClick, onKeyDown)
  // without a regex, to keep static analysers happy.
  const thirdCharCode = name.charCodeAt(2);
  return (
    name[0] === 'o' &&
    name[1] === 'n' &&
    thirdCharCode >= 65 &&
    thirdCharCode <= 90
  );
}

/**
 * Whether a component definition declares this prop — through its own `props`,
 * or through anything Vue merges into that table: a mixin, `extends`, or a
 * mixin registered on the whole app with `app.mixin()`.
 */
function declaresProp(component, name, depth = 0) {
  const definition = definitionOf(component, depth);

  if (!definition) {
    return false;
  }

  if (
    declaredKeys(definition.props).some(
      (key) => key === name || camelize(key) === name
    )
  ) {
    return true;
  }

  return sourcesOf(definition, depth).some((source) =>
    declaresProp(source, name, depth + 1)
  );
}

/**
 * Whether a component definition declares this emitted event — through its own
 * `emits`, or through one of the same sources. Vue resolves an emitted event by
 * looking the handler key up on the vnode rather than through declared props, so
 * a child that emits it has to keep that key.
 */
function declaresEmit(component, eventName, depth = 0) {
  const definition = definitionOf(component, depth);

  if (!definition) {
    return false;
  }

  if (declaredKeys(definition.emits).indexOf(eventName) !== -1) {
    return true;
  }

  return sourcesOf(definition, depth).some((source) =>
    declaresEmit(source, eventName, depth + 1)
  );
}

// An async component keeps what it declares behind `__asyncResolved`, available
// once it has loaded; until then there is nothing to read, and the callback
// stays a listener as well.
function definitionOf(component, depth) {
  const definition =
    component && component.__asyncResolved
      ? component.__asyncResolved
      : component;

  if (!definition || typeof definition !== 'object' || depth > 5) {
    return undefined;
  }

  return definition;
}

// `props` and `emits` each take either a list of names or an object keyed by
// them.
function declaredKeys(option) {
  if (!option) {
    return [];
  }

  return Array.isArray(option) ? option : Object.keys(option);
}

/**
 * The definitions Vue merges into a component's own options. Mixins registered
 * on the app with `app.mixin()` are merged into every component at instance
 * creation, so no definition object shows them — the app context of the
 * component rendering this vnode has them instead.
 */
function sourcesOf(definition, depth) {
  const own = (definition.mixins || []).concat(
    definition.extends ? [definition.extends] : []
  );

  if (depth > 0) {
    return own;
  }

  const instance = Vue.getCurrentInstance && Vue.getCurrentInstance();
  const appContext = instance && instance.appContext;

  return ((appContext && appContext.mixins) || []).concat(own);
}

// `on-toggle-maximize` -> `onToggleMaximize`: Vue matches a declared prop under
// either spelling.
function camelize(value) {
  if (value.indexOf('-') === -1) {
    return value;
  }

  return value
    .split('-')
    .map((chunk, index) =>
      index === 0 || chunk === ''
        ? chunk
        : chunk[0].toUpperCase() + chunk.slice(1)
    )
    .join('');
}

function toVueRef(ref) {
  // Callback refs pass through as Vue 3 function refs.
  if (typeof ref === 'function') {
    return ref;
  }
  // MutableRef objects (`{ current }`) become a function ref that writes
  // through to `.current`.
  if (ref && typeof ref === 'object' && 'current' in ref) {
    return (element) => {
      ref.current = element;
    };
  }
  return undefined;
}

function flattenChildren(nodes) {
  return nodes.reduce((acc, node) => {
    if (Array.isArray(node)) {
      return acc.concat(flattenChildren(node));
    }
    if (node !== undefined && node !== null && node !== false) {
      acc.push(node);
    }
    return acc;
  }, []);
}

export function getDefaultSlot(component) {
  const $slots = component.$slots || component.slots;

  if (typeof $slots.default === 'function') {
    // Vue 3
    return $slots.default();
  }

  // Vue 3 with @vue/compat
  return $slots.default;
}

export function getScopedSlot(component, name) {
  return (component.$slots || component.slots || {})[name];
}
