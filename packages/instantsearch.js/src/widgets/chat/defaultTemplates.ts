import type { ChatTemplates } from './chat';

const defaultTemplates: ChatTemplates = {
  item(data) {
    return JSON.stringify(data, null, 2);
  },
  promptHeader: () =>
    'Ask any question about your data. For example: "Show me red shoes under $50"',
  promptFooter: () =>
    'This is a demo of a chat interface. The responses are generated based on your indexed data.',
};

export default defaultTemplates;
