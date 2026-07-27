/**
 * @jest-environment @instantsearch/testutils/jest-environment-node.ts
 */
import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInitOptions } from '../../../../test/createWidget';
import { Chat } from '../../../lib/chat';
import connectChat from '../connectChat';

describe('server rendering side effects', () => {
  it('does not start chat network work during a server render', () => {
    const chat = new Chat<any>({ persistence: false, transport: {} as any });
    const sendMessage = jest.fn();
    const resumeStream = jest.fn();
    (chat as any).sendMessage = sendMessage;
    (chat as any).resumeStream = resumeStream;

    const widget = connectChat(jest.fn())({
      chat,
      initialUserMessage: 'HELLO FROM SSR',
      disableTriggerValidation: true,
    } as any);
    const helper = algoliasearchHelper(createSearchClient(), 'indexName');

    widget.init(createInitOptions({ helper }));

    expect(sendMessage).not.toHaveBeenCalled();
    expect(resumeStream).not.toHaveBeenCalled();
  });

  it('resumes a stream only in a browser', () => {
    const chat = new Chat<any>({ persistence: false, transport: {} as any });
    const resumeStream = jest.fn();
    (chat as any).resumeStream = resumeStream;

    const widget = connectChat(jest.fn())({
      chat,
      resume: true,
      disableTriggerValidation: true,
    } as any);
    const helper = algoliasearchHelper(createSearchClient(), 'indexName');

    widget.init(createInitOptions({ helper }));

    expect(resumeStream).not.toHaveBeenCalled();
  });
});
