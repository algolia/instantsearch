/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { Chat, CACHE_KEY } from '../chat';
import {
  getChatMessagesRevision,
  releaseChatMessagesRevision,
  retainChatMessagesRevision,
} from '../messagesRevision';

function getContents(messages: Array<{ content: string }>): string[] {
  return messages.map((message) => message.content);
}

describe('server message provenance across updates', () => {
  beforeAll(() => {
    // Mock sessionStorage for the tests
    const sessionStorageMock = (() => {
      const store: Record<string, string> = {};
      return {
        getItem(key: string) {
          return store[key] || null;
        },
        setItem(key: string, value: string) {
          store[key] = value.toString();
        },
        removeItem(key: string) {
          delete store[key];
        },
        clear() {
          Object.keys(store).forEach((key) => {
            delete store[key];
          });
        },
      };
    })();

    Object.defineProperty(globalThis, 'sessionStorage', {
      value: sessionStorageMock,
    });
  });

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterAll(() => {
    delete (globalThis as any).sessionStorage;
  });

  it('keeps restored messages out of a revision captured after an update', () => {
    const agentId = 'agentID-restored-after-update';
    const restoredMessage = { role: 'assistant', content: 'Restored message' };
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify([restoredMessage])
    );

    const chat = new Chat<any>({ agentId });
    expect(getContents(chat.messages)).toEqual(['Restored message']);

    // A render that starts before the chat is touched must not see the
    // restored message.
    const revisionBeforeUpdate = getChatMessagesRevision();
    retainChatMessagesRevision(revisionBeforeUpdate);

    expect(
      getContents(chat['~getServerMessages'](revisionBeforeUpdate))
    ).toEqual([]);

    // An ordinary update: the app appends a message to the restored history.
    chat._state.pushMessage({ role: 'user', content: 'Live message' });

    // A render that starts after that update must still not see the restored
    // message: the server never had it, so it cannot enter a hydration tree.
    const revisionAfterUpdate = getChatMessagesRevision();
    retainChatMessagesRevision(revisionAfterUpdate);

    expect(
      getContents(chat['~getServerMessages'](revisionAfterUpdate))
    ).not.toContain('Restored message');

    releaseChatMessagesRevision(revisionBeforeUpdate);
    releaseChatMessagesRevision(revisionAfterUpdate);
  });

  it('keeps explicit messages in a revision captured after an update', () => {
    const agentId = 'agentID-explicit-after-update';
    const explicitMessage = { role: 'assistant', content: 'Explicit message' };

    const chat = new Chat<any>({ agentId, messages: [explicitMessage] });
    expect(getContents(chat.messages)).toEqual(['Explicit message']);

    // Sensitivity control: the same shape with a seed the server did render.
    // Both arms must keep it, otherwise the assertion above only proves that
    // updates clear the baseline, not that provenance is tracked.
    const revisionBeforeUpdate = getChatMessagesRevision();
    retainChatMessagesRevision(revisionBeforeUpdate);

    expect(
      getContents(chat['~getServerMessages'](revisionBeforeUpdate))
    ).toEqual(['Explicit message']);

    chat._state.pushMessage({ role: 'user', content: 'Live message' });

    const revisionAfterUpdate = getChatMessagesRevision();
    retainChatMessagesRevision(revisionAfterUpdate);

    expect(
      getContents(chat['~getServerMessages'](revisionAfterUpdate))
    ).toContain('Explicit message');

    releaseChatMessagesRevision(revisionBeforeUpdate);
    releaseChatMessagesRevision(revisionAfterUpdate);
  });

  it('seeds caller messages on a persisted chat whose storage was empty', () => {
    // Persistence only makes a chat browser-derived if the restore actually
    // returned something. With empty storage the messages below are as
    // deterministic as any other caller input, and the server renders them, so
    // withholding them here would blank the hydration tree instead of
    // protecting it. The server takes this same branch on every request,
    // because storage is unavailable there.
    const chat = new Chat<any>({ agentId: 'agentID-empty-storage' });

    expect(chat._state['_messagesCanSeedServer']).toBe(true);

    chat.messages = [{ role: 'user', content: 'Caller message' }];

    const revisionAfterUpdate = getChatMessagesRevision();
    retainChatMessagesRevision(revisionAfterUpdate);

    expect(
      getContents(chat['~getServerMessages'](revisionAfterUpdate))
    ).toEqual(['Caller message']);

    releaseChatMessagesRevision(revisionAfterUpdate);
  });

  it('withholds caller messages added to a chat restored from storage', () => {
    // The same shape as above with a non-empty restore. This is the pair that
    // makes the branch above meaningful: the discriminator is provenance, not
    // whether an update happened.
    const agentId = 'agentID-restored-then-updated';
    sessionStorage.setItem(
      `${CACHE_KEY}-${agentId}`,
      JSON.stringify([{ role: 'assistant', content: 'Restored message' }])
    );

    const chat = new Chat<any>({ agentId });

    expect(chat._state['_messagesCanSeedServer']).toBe(false);

    chat.messages = [{ role: 'user', content: 'Caller message' }];

    const revisionAfterUpdate = getChatMessagesRevision();
    retainChatMessagesRevision(revisionAfterUpdate);

    expect(chat['~getServerMessages'](revisionAfterUpdate)).toEqual([]);

    releaseChatMessagesRevision(revisionAfterUpdate);
  });
});
