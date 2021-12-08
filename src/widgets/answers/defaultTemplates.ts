import type { AnswersComponentTemplates } from '../../components/Answers/Answers.js';

const defaultTemplates: AnswersComponentTemplates = {
  header: '',
  loader: '',
  item: (item) => JSON.stringify(item),
};

export default defaultTemplates;
