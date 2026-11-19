import { renderComponent, renderSettled } from '@ember/renderer';
import { afterEach } from 'vitest';

const rendered: Array<{ destroy(): void }> = [];

/**
 * Renders a component into a new element at the end of `document.body`,
 * the same as the setups of the other flavors.
 *
 * Each render is destroyed after its test.
 */
export function render(component: object, args: Record<string, unknown> = {}) {
  const into = document.body.appendChild(document.createElement('div'));
  const result = renderComponent(component, { into, args });

  rendered.push(result);

  return renderSettled().then(() => result);
}

/**
 * The shared suites wrap each interaction in `act`.
 * Ember renders after the interaction, so `act` waits for that render.
 */
export function act(callback: () => void | Promise<void>) {
  const result = callback();

  if (result && typeof result.then === 'function') {
    return result.then(() => renderSettled()).then(() => undefined);
  }

  return undefined;
}

afterEach(() => {
  for (let i = 0; i < rendered.length; i++) {
    rendered[i]!.destroy();
  }

  rendered.length = 0;
});
