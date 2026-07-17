/**
 * @jest-environment node
 */
import { ChatState } from '../chat';

// In a Node (server) environment `sessionStorage` is undefined, mirroring
// server-side rendering. Constructing the chat state must not throw and must
// fall back to empty initial messages without attempting to persist. `Chat`
// delegates directly to `ChatState`, so covering the state covers the SSR path.
describe('ChatState (SSR / no sessionStorage)', () => {
  it('runs in an environment without sessionStorage', () => {
    expect(typeof sessionStorage).toBe('undefined');
  });

  it('constructs with empty initial messages and does not throw', () => {
    let chatState: ChatState<any>;

    expect(() => {
      chatState = new ChatState<any>('ssr-agent');
    }).not.toThrow();

    expect(chatState!.messages).toEqual([]);
  });

  it('does not throw when status changes to ready (persistence skipped)', () => {
    const chatState = new ChatState<any>('ssr-agent');
    chatState.messages = [{ role: 'user', content: 'Hello' } as any];

    expect(() => {
      chatState.status = 'ready';
    }).not.toThrow();
  });
});
