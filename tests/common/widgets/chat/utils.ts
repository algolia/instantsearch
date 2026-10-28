import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import type { Act } from '../../common';
import type { Chat } from 'instantsearch-core';

// Loaded with `require` on purpose: importing `vue` would pull its type
// declarations into this (React JSX) compilation, and Vue 2's augment the
// global `JSX` namespace, breaking every `<div />` in the shared tests.
function getVue(): { h: (...args: unknown[]) => unknown; version: string } {
  return require('vue');
}

export const createDefaultWidgetParams = (chat?: Chat<any>) =>
  chat === undefined ? { agentId: 'agentId' } : { chat };

/**
 * Vue's `h`, for the `vue` widget params' render functions. It can only be
 * called while a component renders, which is the case for the chat's
 * component props (Vue 2's global `h` needs a current instance).
 */
export const vueH = (...args: unknown[]) => getVue().h(...args);

/**
 * Creates a Vue VNode with HTML attributes and event listeners for the `vue`
 * widget params, in a way that works for both Vue 2 (`attrs`/`on` nested in
 * the data object) and Vue 3 (flat props, `onClick`-style listeners). For
 * `class`-only elements, `vueH` is enough.
 */
export function createVueElement(
  tag: string,
  {
    class: className,
    on = {},
    ...attrs
  }: Record<string, unknown> & { on?: Record<string, () => void> },
  children?: string | unknown[]
) {
  const isVue3 = Number(getVue().version.split('.')[0]) >= 3;
  const listeners = Object.keys(on).reduce<Record<string, () => void>>(
    (acc, event) => {
      acc[`on${event[0].toUpperCase()}${event.slice(1)}`] = on[event];
      return acc;
    },
    {}
  );
  const data = isVue3
    ? { class: className, ...attrs, ...listeners }
    : { class: className, attrs, on };

  return vueH(tag, data, children);
}

// The chat is opened by clicking the `chatTrigger` widget's button; tests
// using this helper must mount a `chatTrigger`/`<ChatTrigger />` alongside the
// `chat` widget so that an `.ais-ChatToggleButton` is in the DOM.
export async function openChat(act: Act) {
  await act(async () => {
    await wait(0);
  });

  userEvent.click(document.querySelector('.ais-ChatToggleButton')!);

  await act(async () => {
    await wait(0);
  });
}
