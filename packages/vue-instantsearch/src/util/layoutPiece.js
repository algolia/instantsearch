/**
 * Renders one of the pieces a chat layout receives — the header, the messages,
 * the prompt — into something the shared factory can put in its tree.
 *
 * The chat and its users hand over any of: an already-rendered element (what
 * `ais-chat` gives its built-in layouts), a Vue component definition, a Vue 2
 * component constructor, a React-style render function, or a plain child such
 * as a string. Only the component shapes need `h`.
 *
 * `h` is the React-style `createElement` (the one the shared tree is built
 * with), `hVue` the Vue-style one — the same pair `renderReactCompat` hands the
 * render function, and the constructor below only renders through the latter.
 */
export function renderLayoutPiece(h, hVue, piece) {
  if (!piece) {
    return piece;
  }

  if (typeof piece === 'function') {
    // A constructor has to be instantiated, which only the Vue-style
    // `createElement` does: the React-style one calls functions, and a
    // `Vue.extend(...)` called without a receiver throws inside `_init`.
    // Class components (`vue-class-component`, hand-rolled `Vue.extend`) hand
    // over exactly this shape.
    if (isVue2Constructor(piece)) {
      return hVue(piece);
    }

    return h(piece);
  }

  // A rendered element passes through: Vue 3 marks its vnodes, Vue 2's carry
  // `tag` and `data`. A plain child or a list of them does too.
  if (typeof piece !== 'object' || Array.isArray(piece) || isVNode(piece)) {
    return piece;
  }

  // Anything else is a component definition: options with `render`, a
  // `setup()` function, or a bare `template` (the runtime compiler builds
  // `render` when it mounts). It has to be rendered in tag position, or it
  // lands in the tree as a raw object and renders nothing.
  return h(piece);
}

// `Vue.extend(...)` copies the options onto the constructor it returns and
// numbers it; neither shows up on a render function or a Vue 3 component.
function isVue2Constructor(piece) {
  return typeof piece.cid === 'number' && typeof piece.options === 'object';
}

function isVNode(piece) {
  return (
    piece.__v_isVNode === true ||
    (Object.prototype.hasOwnProperty.call(piece, 'tag') &&
      Object.prototype.hasOwnProperty.call(piece, 'data'))
  );
}
