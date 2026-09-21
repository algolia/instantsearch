/**
 * How long a leaving state waits for `transitionend` before committing on its
 * own. The theme fades in 0.3s; without it, or with a theme that drops the
 * transition, the event never fires.
 */
export const TRANSITION_FALLBACK_MS = 500;
