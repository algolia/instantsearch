import { registerDestructor } from '@ember/destroyable';
import { render } from 'preact';

import type { ComponentChild } from 'preact';

/**
 * Renders a component of `instantsearch-ui-components` with Preact,
 * and gives back its root element, for a template to insert with `{{...}}`.
 *
 * Preact renders into a detached host element.
 * Glimmer then moves the root element into the page.
 *
 * Later renders patch the root element where it is,
 * so the root must keep its tag name from one render to the next.
 */
export class PreactRoot {
  #host = document.createElement('div');
  #root: Node | null = null;

  constructor(owner: object) {
    registerDestructor(owner, () => render(null, this.#host));
  }

  render(vnode: ComponentChild): Node | null {
    render(vnode, this.#host);

    /**
     * The host holds the root only until Glimmer moves it into the page.
     */
    const next = this.#host.firstChild;

    if (next) this.#root = next;

    return this.#root;
  }
}
