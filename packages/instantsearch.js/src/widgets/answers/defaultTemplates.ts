import type { AnswersComponentTemplates } from '../../components/Answers/Answers';

const defaultTemplates: AnswersComponentTemplates = {
  header() {
    return '';
  },
  loader() {
    return '';
  },
  item(item) {
    return JSON.stringify(item);
  },
};

export default defaultTemplates;
