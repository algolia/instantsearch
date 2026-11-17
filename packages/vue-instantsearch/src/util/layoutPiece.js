/**
 * Renders one of the pieces a chat layout receives — the header, the messages,
 * the prompt — into something the shared factory can put in its tree.
 *
 * The chat and its users hand over any of: an already-rendered element (what
 * `ais-chat` gives its built-in layouts), a Vue component definition, a
 * React-style render function, or a plain child such as a string. Only the two
 * component shapes need `h`.
 */
export function renderLayoutPiece(h, piece) {
  if (!piece) {
    return piece;
  }

  if (typeof piece === 'function') {
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

function isVNode(piece) {
  return (
    piece.__v_isVNode === true ||
    (Object.prototype.hasOwnProperty.call(piece, 'tag') &&
      Object.prototype.hasOwnProperty.call(piece, 'data'))
  );
}
