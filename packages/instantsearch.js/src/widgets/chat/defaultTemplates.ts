import { ChatTemplates } from './chat';

const defaultTemplates = {
  item(data) {
    return JSON.stringify(data, null, 2);
  },
} satisfies ChatTemplates;

export default defaultTemplates;
