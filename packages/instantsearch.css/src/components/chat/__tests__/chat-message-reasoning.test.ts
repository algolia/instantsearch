/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { compileString } from 'sass';

describe('Chat reasoning styles', () => {
  test('points the disclosure chevron down when closed and up when open', () => {
    const source = readFileSync(
      resolve(__dirname, '../_chat-message-reasoning.scss'),
      'utf8'
    );
    const style = document.createElement('style');
    style.textContent = compileString(source).css;
    document.head.appendChild(style);

    const disclosure = document.createElement('details');
    disclosure.className = 'ais-ChatMessageReasoning';
    disclosure.innerHTML = `
      <summary>
        <span class="ais-ChatMessageReasoning-chevron"></span>
      </summary>
    `;
    document.body.appendChild(disclosure);
    const chevron = disclosure.querySelector<HTMLElement>(
      '.ais-ChatMessageReasoning-chevron'
    )!;

    expect(getComputedStyle(chevron).transform).toBe('none');

    disclosure.open = true;
    expect(getComputedStyle(chevron).transform).toBe('rotate(180deg)');
  });
});
